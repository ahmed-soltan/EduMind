/**
 * useUpgradeSubscription Hook
 * 
 * A React hook for handling subscription plan upgrades/downgrades
 * 
 * Usage Example:
 * 
 * ```tsx
 * import { useUpgradeSubscription } from "@/features/billing/api/use-upgrade-subscription";
 * 
 * const MyComponent = () => {
 *   const { mutate: upgradeSubscription, isPending, error } = useUpgradeSubscription();
 * 
 *   const handleUpgrade = () => {
 *     upgradeSubscription({
 *       planId: "plan-id-here",
 *       billingCycle: "monthly" // or "yearly"
 *     });
 *   };
 * 
 *   return (
 *     <button onClick={handleUpgrade} disabled={isPending}>
 *       {isPending ? "Upgrading..." : "Upgrade Plan"}
 *     </button>
 *   );
 * };
 * ```
 * 
 * Features:
 * - Automatically invalidates related queries (subscription, usage, invoices)
 * - Shows success/error toast notifications
 * - Handles proper error states
 * - TypeScript support with proper interfaces
 * 
 * API Endpoint: POST /api/subscriptions/upgrade
 * 
 * Request Body:
 * {
 *   planId: string,
 *   billingCycle: "monthly" | "yearly"
 * }
 * 
 * Response:
 * {
 *   message: string,
 *   newSubscription: {
 *     id: string,
 *     planId: string,
 *     billingCycle: string,
 *     status: string
 *   }
 * }
 */

export type { UpgradeSubscriptionData } from "./use-upgrade-subscription";
