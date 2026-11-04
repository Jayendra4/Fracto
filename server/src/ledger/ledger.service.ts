import { Injectable, Logger } from '@nestjs/common';
import * as grpc from '@grpc/grpc-js';
import { connect, hash, signers } from '@hyperledger/fabric-gateway';
import * as crypto from 'crypto';
import * as fs from 'fs/promises';
import * as path from 'path';
import { TextDecoder } from 'util';

@Injectable()
export class LedgerService {
  private readonly logger = new Logger(LedgerService.name);

  private readonly channelName = process.env.CHANNEL_NAME || 'assetlist';
  private readonly chaincodeName = process.env.CHAINCODE_NAME || 'basic';
  private readonly mspId = process.env.MSP_ID || 'Org1MSP';

  private cryptoPath =
    '/home/mongoose/Desktop/project/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com';
  private keyDirectoryPath = `${this.cryptoPath}/users/User1@org1.example.com/msp/keystore`;
  private certDirectoryPath = `${this.cryptoPath}/users/User1@org1.example.com/msp/signcerts`;
  private tlsCertPath = `${this.cryptoPath}/peers/peer0.org1.example.com/tls/ca.crt`;

  private readonly peerEndpoint = process.env.PEER_ENDPOINT || 'localhost:7051';
  private readonly peerHostAlias =
    process.env.PEER_HOST_ALIAS || 'peer0.org1.example.com';

  private utf8Decoder = new TextDecoder();

  // Helper to get first file in dir
  private async getFirstFileName(dirPath: string): Promise<string> {
    const files = await fs.readdir(dirPath);
    if (files.length === 0)
      throw new Error(`No files found in directory: ${dirPath}`);
    return path.join(dirPath, files[0]);
  }

  // Create gRPC client connection
  private async newGrpcConnection(): Promise<grpc.Client> {
    const tlsRootCert = await fs.readFile(this.tlsCertPath);
    const tlsCredentials = grpc.credentials.createSsl(tlsRootCert);
    return new grpc.Client(this.peerEndpoint, tlsCredentials, {
      'grpc.ssl_target_name_override': this.peerHostAlias,
    });
  }

  // Create identity from cert
  private async newIdentity() {
    const certPath = await this.getFirstFileName(this.certDirectoryPath);
    const credentials = await fs.readFile(certPath);
    return { mspId: this.mspId, credentials };
  }

  // Create signer from private key
  private async newSigner() {
    const keyPath = await this.getFirstFileName(this.keyDirectoryPath);
    const privateKeyPem = await fs.readFile(keyPath);
    const privateKey = crypto.createPrivateKey(privateKeyPem);
    return signers.newPrivateKeySigner(privateKey);
  }

  // Create Gateway connection & contract object
  private async getContract() {
    const client = await this.newGrpcConnection();
    const gateway = connect({
      client,
      identity: await this.newIdentity(),
      signer: await this.newSigner(),
      hash: hash.sha256,
      evaluateOptions: () => ({ deadline: Date.now() + 5000 }),
      endorseOptions: () => ({ deadline: Date.now() + 15000 }),
      submitOptions: () => ({ deadline: Date.now() + 5000 }),
      commitStatusOptions: () => ({ deadline: Date.now() + 60000 }),
    });

    const network = gateway.getNetwork(this.channelName);
    const contract = network.getContract(this.chaincodeName);

    // Return contract and a function to close connection
    return {
      contract,
      close: () => {
        gateway.close();
        client.close();
      },
    };
  }

  // Create Asset (API call)
  async createAsset(
    id: string,
    assetType: string,
    subType: string,
    owner: string,
    appraisedValue: string,
    totalFractions: string,
  ) {
    const { contract, close } = await this.getContract();

    try {
      await contract.submitTransaction(
        'CreateAsset',
        id,
        assetType,
        subType,
        owner,
        appraisedValue,
        totalFractions,
      );
      return { message: `Asset ${id} created successfully` };
    } finally {
      close();
    }
  }

  // Get All Assets
  async getAllAssets() {
    const { contract, close } = await this.getContract();

    try {
      const resultBytes = await contract.evaluateTransaction('GetAllAssets');
      const resultJson = this.utf8Decoder.decode(resultBytes);
      const result = JSON.parse(resultJson);
      return result;
    } finally {
      close();
    }
  }

  // Transfer Fraction
  async transferFraction(
    id: string,
    fromOwner: string,
    toOwner: string,
    fractionCount: string,
  ) {
    const { contract, close } = await this.getContract();

    try {
      await contract.submitTransaction(
        'TransferFraction',
        id,
        fromOwner,
        toOwner,
        fractionCount,
      );
      return {
        message: `Transferred ${fractionCount} fractions of asset ${id} from ${fromOwner} to ${toOwner}`,
      };
    } finally {
      close();
    }
  }

  // Read Asset By ID
  async readAsset(id: string) {
    const { contract, close } = await this.getContract();

    try {
      const resultBytes = await contract.evaluateTransaction('ReadAsset', id);
      const resultJson = this.utf8Decoder.decode(resultBytes);
      const result = JSON.parse(resultJson);
      return result;
    } finally {
      close();
    }
  }
}
