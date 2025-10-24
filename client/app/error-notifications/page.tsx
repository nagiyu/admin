import { PermissionLevel } from '@common/enums/PermissionLevel';

import FeatureGuard from '@client-common/components/authorization/FeatureGuard';

import { AdminFeature } from '@admin/consts/AdminConst';

export default function ErrorNotificationsPage() {
    return (
        <FeatureGuard
            feature={AdminFeature.ERROR_NOTIFICATION}
            level={PermissionLevel.VIEW}
        >
            <div>Error Notifications Page</div>
        </FeatureGuard>
    )
}
