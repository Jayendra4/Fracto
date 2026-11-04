import { useState } from 'react';
import { type Meta, type StoryObj } from '@storybook/react-vite';
import CustomSelect from '@/components/Base/CustomSelect';

const meta: Meta<typeof CustomSelect> = {
  title: 'Base/CustomSelect',
  component: CustomSelect,
  argTypes: {
    placeholder: { control: 'text' },
    isMulti: { control: 'boolean' },
    options: { control: 'object' },
    value: { control: false },
  },
};

export default meta;

type Story = StoryObj<typeof CustomSelect>;

export const SingleSelect: Story = {
  render: (args) => {
    const [value, setValue] = useState<string | number>(args.value as any);

    return (
      <CustomSelect
        {...args}
        value={value}
        onChange={(val) => setValue(val as string | number)}
      />
    );
  },
  args: {
    placeholder: 'Select an option',
    isMulti: false,
    value: '',
    options: [
      { label: 'Option 1', value: 'option1' },
      { label: 'Option 2', value: 2 },
      { label: 'Option 3', value: 'option3' },
    ],
  },
};

export const MultiSelect: Story = {
  render: (args) => {
    const [value, setValue] = useState<(string | number)[]>(
      (args.value as any) || []
    );

    return (
      <CustomSelect
        {...args}
        value={value}
        onChange={(val) => setValue(val as (string | number)[])}
      />
    );
  },
  args: {
    placeholder: 'Select options',
    isMulti: true,
    value: [],
    options: [
      { label: 'Option 1', value: 1 },
      { label: 'Option 2', value: 'option2' },
      { label: 'Option 3', value: 3 },
    ],
  },
};
