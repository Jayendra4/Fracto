import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';

interface MobileInputProps {
  value?: string;
  onChange?: (data: {
    phone: string;
    dialCode: string;
    countryCode: string;
    countryName: string;
  }) => void;
}

export default function MobileInput({ value, onChange }: MobileInputProps) {
  return (
    <PhoneInput
      country="in"
      enableSearch
      inputClass="custom-phone-input"
      buttonClass="custom-flag-button"
      dropdownClass="custom-dropdown"
      containerClass="custom-phone-container"
      placeholder="Enter your mobile number"
      value={value}
      onChange={(phone, country) => {
      }}
    />
  );
}
