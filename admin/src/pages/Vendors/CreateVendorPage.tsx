import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select';

import 'react-phone-number-input/style.css';
import PhoneInput from 'react-phone-number-input';
import { useCreateVendorMutation } from '@/store/api/vendorApi'; // new 4 update
import toast from 'react-hot-toast';

type Category = 'Legal' | 'Compliance' | 'Valuation' | 'Audit' | 'Trustee';

export default function CreateVendorPage() {
  const navigate = useNavigate();

  const [createVendor, { isLoading }] = useCreateVendorMutation();

  /* ===================== FORM STATE ===================== */
  const [formData, setFormData] = useState({
    vendorName: '',
    category: 'Legal' as Category,
    description: '',
    website: '',
    email: '',
    mobile: '',
  });

  /* ===================== ERROR STATE ===================== */
  const [errors, setErrors] = useState<{
    vendorName?: string;
    email?: string;
    mobile?: string;
  }>({});

  /* ===================== SUBMIT ===================== */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: typeof errors = {};
    if (!formData.vendorName.trim()) newErrors.vendorName = 'Vendor name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';

    if (!formData.mobile || formData.mobile.length < 10) {
      newErrors.mobile = 'Please enter a valid mobile number';
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      await createVendor({
        vendorName: formData.vendorName,
        category: formData.category,
        description: formData.description || undefined,
        email: formData.email,
        mobile: formData.mobile,
        website: formData.website || undefined,
      }).unwrap();

      navigate('/vendors-page');
    } catch (error: any) {
      toast.error(error?.data?.message);
      console.error('Update failed', error);
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex items-center gap-4">
        <Button onClick={() => navigate(-1)}>← Back</Button>
        <h1 className="text-2xl font-bold">Add Vendor</h1>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6">
        <div>
          <Label>
            Vendor Name <span className="text-red-600">*</span>
          </Label>
          <Input
            placeholder="Enter vendor name..."
            value={formData.vendorName}
            onChange={(e) => {
              setFormData({ ...formData, vendorName: e.target.value });
              if (errors.vendorName) {
                setErrors((prev) => ({ ...prev, vendorName: undefined }));
              }
            }}
          />
          {errors.vendorName && <p className="text-red-500 text-sm mt-1">{errors.vendorName}</p>}
        </div>

        <div>
          <Label>
            Category <span className="text-red-600">*</span>
          </Label>
          <Select
            value={formData.category}
            onValueChange={(v) => setFormData({ ...formData, category: v as Category })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select Category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Legal">Legal</SelectItem>
              <SelectItem value="Compliance">Compliance</SelectItem>
              <SelectItem value="Valuation">Valuation</SelectItem>
              <SelectItem value="Audit">Audit</SelectItem>
              <SelectItem value="Trustee">Trustee</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label>
            Email Address <span className="text-red-600">*</span>
          </Label>
          <Input
            type="email"
            placeholder="example@vendor.com"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (errors.email) {
                setErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
        </div>

        <div>
          <Label>
            Mobile Number <span className="text-red-600">*</span>
          </Label>
          <div className="phone-input-wrapper">
            <PhoneInput
              international
              defaultCountry="IN"
              countries={['IN', 'AE']}
              placeholder="Enter mobile number"
              value={formData.mobile}
              maxLength={15}
              onChange={(value) => {
                setFormData({ ...formData, mobile: value || '' });
                if (errors.mobile) {
                  setErrors((prev) => ({ ...prev, mobile: undefined }));
                }
              }}
              className="custom-phone-input"
            />
          </div>
          {errors.mobile && <p className="text-red-500 text-sm mt-1">{errors.mobile}</p>}
        </div>

        <div>
          <Label>Website</Label>
          <Input
            placeholder="https://example.com"
            value={formData.website}
            onChange={(e) => setFormData({ ...formData, website: e.target.value })}
          />
        </div>

        <div>
          <Label>Description (Optional)</Label>
          <Input
            placeholder="Add some details about the vendor..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          />
        </div>

        <div className="col-span-2">
          <Button type="submit" className="w-full md:w-auto px-8" disabled={isLoading}>
            {isLoading ? 'Adding...' : 'Add Vendor'}
          </Button>
        </div>
      </form>

      <style>{`
        .custom-phone-input {
          display: flex;
          align-items: center;
          height: 2.5rem;
          width: 100%;
          border-radius: 0.375rem;
          border: 1px solid hsl(var(--input));
          background-color: hsl(var(--background));
          padding: 0 0.75rem;
          font-size: 0.875rem;
        }

        .PhoneInputInput {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          padding-left: 0.5rem;
          color: hsl(var(--foreground));
        }

        .PhoneInputCountrySelect {
          background-color: hsl(var(--background)) !important;
          color: hsl(var(--foreground)) !important;
          cursor: pointer;
          border: none;
          outline: none;
        }

        .PhoneInputCountrySelect option {
          background-color: ;
          color: white;
        }

        .PhoneInputCountryIcon {
          width: 1.5rem;
          height: 1rem;
        }
      `}</style>
    </div>
  );
}
