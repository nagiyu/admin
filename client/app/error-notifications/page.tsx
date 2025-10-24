'use client';

import React, { useEffect, useState } from 'react';

import { PermissionLevel } from '@common/enums/PermissionLevel';

import BasicStack from '@client-common/components/Layout/Stacks/BasicStack';
import BasicTable, { Column } from '@client-common/components/data/table/BasicTable';
import ContainedButton from '@client-common/components/inputs/Buttons/ContainedButton';
import FeatureGuard from '@client-common/components/authorization/FeatureGuard';
import LoadingContent from '@client-common/components/content/LoadingContent';

import { AdminFeature } from '@admin/consts/AdminConst';
import { ErrorNotificationDataType } from '@admin/interfaces/data/ErrorNotificationDataType';

import { ErrorNotificationFetchService } from '@/services/ErrorNotificationFetchService.client';

const fetchService = new ErrorNotificationFetchService();

const columns: Column<ErrorNotificationDataType>[] = [
    { id: 'id', label: 'ID' },
    { id: 'rootFeature', label: 'Root Feature' },
    { id: 'feature', label: 'Feature' },
    { id: 'message', label: 'Message' },
    { id: 'stack', label: 'Stack', format: (value) => <pre style={{ wordBreak: 'break-all' }}>{value}</pre> },
]

export default function ErrorNotificationsPage() {
    const [errorList, setErrorList] = useState<ErrorNotificationDataType[]>([]);

    const fetchData = async () => {
        const data = await fetchService.get();
        setErrorList(data);
    };

    useEffect(() => {
        (async () => {
            await fetchData();
        })();
    }, []);

    return (
        <FeatureGuard
            feature={AdminFeature.ERROR_NOTIFICATION}
            level={PermissionLevel.VIEW}
        >
            <LoadingContent>
                {(loading, runWithLoading) => (
                    <BasicStack>
                        <ContainedButton
                            label='Refresh'
                            onClick={() => runWithLoading(async () => await fetchData())}
                            disabled={loading}
                        />
                        <BasicTable
                            columns={columns}
                            data={errorList}
                            loading={loading}
                        />
                    </BasicStack>
                )}
            </LoadingContent>
        </FeatureGuard>
    )
}
