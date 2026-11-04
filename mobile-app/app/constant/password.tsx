export const getPasswordStrength = (password: string) => {
    let score = 0;

    if (password?.length >= 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;

    if (score <= 1) {
        return { label: 'Low', level: 2, color: '#FF4D4F' };
    }
    if (score === 2 || score === 3) {
        return { label: 'Medium', level: 3, color: '#FAAD14' };
    }
    return { label: 'High', level: 4, color: '#52C41A' };
};
