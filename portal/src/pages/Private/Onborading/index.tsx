// import { useState, useEffect, type JSX } from 'react';
// import { useNavigate } from 'react-router-dom';
// import Cookies from 'js-cookie';
// import { useDispatch } from 'react-redux';
// import type { AppDispatch } from '@/redux/store';
// import StepperForm from '@/components/StepperForm';
// import StepTransition from '@/components/StepTransition';
// import Loader from '@/components/Loader';
// import { useOnboarding } from '@/hooks/useOnboarding';
// import { useFetchUserDataFlow } from '@/hooks/useFetchUserDataFlow';
// import { useStepLoader } from '@/hooks/useStepLoader';
// import {
//   saveUserProfileStep,
//   setHeaderStepper,
// } from '@/redux/slices/userProfileSlice';
// import {
//   useCompletedSteps,
//   useRwaStep,
//   useSteps,
// } from '@/hooks/CompleteProfile';
// import { isValidStep } from '@/utils/CompleteProfile';
// import {
//   KybStep,
//   DirectorsOrUserKycStep,
//   RwaStep,
// } from '@/components/CompleteProfile';

// export default function Onboarding(): JSX.Element {
//   const dispatch = useDispatch<AppDispatch>();
//   const navigate = useNavigate();

//   const [errorModal, setErrorModal] = useState({ open: false, message: '' });

//   const { run: runUserFetchFlow } = useFetchUserDataFlow();

//   const {
//     isCompany,
//     hasCompany,
//     hasDirectors,
//     hasAssets,
//     hasBankAccounts,
//     rwaRequired,
//     rwaBlocked,
//     rwaOptional,
//   } = useOnboarding();

//   const steps = useSteps(isCompany, rwaRequired, rwaOptional);

//   const rwaStep = useRwaStep(isCompany, rwaRequired, rwaOptional);

//   const { completedSteps, isStepCompleted } = useCompletedSteps({
//     isCompany,
//     hasCompany,
//     hasDirectors,
//     hasAssets,
//     hasBankAccounts,
//     rwaRequired,
//     rwaOptional,
//   });

//   const canAccessRwa = isCompany ? hasCompany && hasDirectors : hasDirectors;

//   const determineInitialStep = (): 1 | 2 | 3 => {
//     if (isCompany) {
//       if (!hasCompany) return 1;
//       if (!hasDirectors) return 2;
//       return 1;
//     } else {
// <<<<<<<< HEAD:src/pages/Private/Onborading/index.tsx
//       if ( !hasDirectors) return 2;
//       if ((rwaRequired || rwaOptional) && !hasAssets) return 3;
// ========
//       if (!hasDirectors) return 1;
// >>>>>>>> 69aa0168c37460eb79beebb8934df7b2b7b3d7e4:src/components/Dashboard/Onboarding/index.tsx
//       return 1;
//     }
//   };

//   const [currentStep, setCurrentStep] = useState<1 | 2 | 3 | 4 | 5>(1);
//   const stepLoading = useStepLoader(currentStep);

//   useEffect(() => {
//     const token = Cookies.get('hof_token') || '';
//     if (token) {
//       runUserFetchFlow(token);
//     }
//   }, []);

//   useEffect(() => {
//     setCurrentStep(determineInitialStep());
//   }, [isCompany, hasCompany, hasDirectors, hasBankAccounts, hasAssets]);

//   const handleStepClick = (id: number) => {
//     if (id === currentStep) return;

//     if (
//       isStepCompleted(id) ||
//       (id === rwaStep && rwaOptional && canAccessRwa)
//     ) {
//       setCurrentStep(id as any);
//     }
//   };

//   const handleRouteForStep = (id: number) => {
//     const base = '/dashboard/onboarding';
//     //  if ( isStepCompleted(id)) return;
//     if (isCompany) {
//       if (id === 1) navigate(`${base}/kyb`);
//       if (id === 2) navigate(`${base}/kyc`);
//       if (id === 3 && canAccessRwa) navigate(`${base}/rwa`);
//     } else {
// <<<<<<<< HEAD:src/pages/Private/Onborading/index.tsx
//       if (id === 2) navigate(`${base}/user-kyc`);
//       if (id === 3) navigate(`${base}/rwa`);
// ========
//       if (id === 1) navigate(`${base}/user-kyc`);
//       if (id === 2 && canAccessRwa && !rwaBlocked) navigate(`${base}/rwa`);
// >>>>>>>> 69aa0168c37460eb79beebb8934df7b2b7b3d7e4:src/components/Dashboard/Onboarding/index.tsx
//     }
//   };

//   const currentStepMeta = steps.find((s) => s.step === currentStep);
//   const nextStepMeta = steps.find((s) => s.step === currentStep + 1);

//   useEffect(() => {
//     if (!currentStepMeta) return;

//     dispatch(saveUserProfileStep(currentStep));

//     dispatch(
//       setHeaderStepper({
//         currentStep,
//         totalSteps: steps.length,
//         title: currentStepMeta.title,
//         nextTitle: nextStepMeta?.title,
//         steps: steps.map((s) => ({
//           step: s.step,
//           title: s.title,
//           completed: !!isStepCompleted(s.step),
//         })),
//       })
//     );
//   }, [currentStep, steps]);

//   const renderWithLoader = (content: JSX.Element | null) =>
//     stepLoading ? (
//       <div className="min-h-[300px] flex items-center justify-center">
//         <Loader />
//       </div>
//     ) : (
//       content
//     );

//   const stepKeyMap: Record<number, string> = isCompany
//     ? {
//         1: 'kyb',
//         2: 'directors',
//         3: 'rwa',
//       }
//     : {
//         1: 'userKyc',
//         2: 'rwa',
//       };

//   const stepKey = stepKeyMap[currentStep];

//   const renderContent = () => {
//     switch (stepKey) {
//       case 'kyb':
//         return (
//           <KybStep
//             isStepCompleted={isStepCompleted}
//             handleRouteForStep={handleRouteForStep}
//           />
//         );

//       case 'directors':
//       case 'userKyc':
//         return (
//           <DirectorsOrUserKycStep
//             stepKey={stepKey}
//             currentStep={currentStep}
//             isStepCompleted={isStepCompleted}
//             handleRouteForStep={handleRouteForStep}
//           />
//         );
//       case 'rwa':
//         return (
//           <RwaStep
//             rwaBlocked={rwaBlocked}
//             rwaOptional={rwaOptional}
//             navigate={navigate}
//             isValidStep={isValidStep}
//             rwaStep={rwaStep}
//             isStepCompleted={isStepCompleted}
//             handleRouteForStep={handleRouteForStep}
//           />
//         );

//       default:
//         return null;
//     }
//   };

//   const completedStepsForStepper: Record<number, boolean> = Object.fromEntries(
//     steps.map((s) => [s.step, !!completedSteps[s.step]])
//   );

//   return (
//     <>
//       <StepperForm
//         steps={steps}
//         currentStep={currentStep}
//         onStepClick={handleStepClick}
//         completedSteps={completedStepsForStepper}
//       >
//         <StepTransition step={currentStep}>
//           {renderWithLoader(renderContent())}
//         </StepTransition>
//       </StepperForm>

//       <GlobalModal
//         open={errorModal.open}
//         title="Error"
//         message={errorModal.message}
//         onClose={() => setErrorModal({ open: false, message: '' })}
//       />
//     </>
//   );
// }
