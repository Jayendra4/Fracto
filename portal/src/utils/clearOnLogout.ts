import Cookies from 'js-cookie';

export const clearOnLogout = () => {
  Cookies.remove('hof_token');
  Cookies.remove('hof_role');
  Cookies.remove('hof_assets');
  Cookies.remove('hof_bank');
  localStorage.removeItem('hof_user');
  localStorage.removeItem('kyc_data');
  localStorage.removeItem('kyc_step');
  localStorage.removeItem('hof_company');
  localStorage.removeItem('kyb_step');
  localStorage.removeItem('kyb_step_data');
  localStorage.removeItem('kyb_company_id');
  localStorage.removeItem('director_kyc_data');
  localStorage.removeItem('hof_login_draft');
  localStorage.removeItem('hof_register_user_type');
  localStorage.removeItem('hof_registration_draft');
  localStorage.removeItem('hof_registration_step');
  localStorage.removeItem('rwa_asset_id');
  localStorage.removeItem('user_profile_step');
  localStorage.removeItem('rwa_asset_step');
  localStorage.removeItem('rwa_asset_step_data');

  Object.keys(localStorage)
    .filter((key) => key.startsWith('rwa_step1_draft_'))
    .forEach((key) => localStorage.removeItem(key));
};
