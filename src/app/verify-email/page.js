import { Suspense } from 'react';
import VerifyEmailContent from '../../components/common/VerifyEmailContent';

export default function Page() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerifyEmailContent />
    </Suspense>
  );
}