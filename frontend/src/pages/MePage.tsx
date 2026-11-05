import { PasswordForm } from '../features/auth/PasswordForm';
import { ProfileForm } from '../features/auth/ProfileForm';

export function MePage() {
  return (
    <>
      <ProfileForm />
      <PasswordForm />
    </>
  );
}
