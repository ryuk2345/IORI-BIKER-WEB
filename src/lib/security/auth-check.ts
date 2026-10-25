/**
 * Módulo de verificación de seguridad y roles administrativos.
 * Delega en la función canónica getUserRole().
 */
export { getUserRole, verifyAdminOnly, verifyStaffAuth } from '@/lib/auth/get-user-role';
export type { 
  GetUserRoleResult, 
  AuthVerificationResult, 
  AuthVerificationResult as AuthCheckResult 
} from '@/lib/auth/get-user-role';
