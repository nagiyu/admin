'use client';

import React, { useEffect, useState } from 'react';

import { PermissionLevel } from '@common/enums/PermissionLevel';

import BasicTable, { Column } from '@client-common/components/data/table/BasicTable';
import FeatureGuard from '@client-common/components/authorization/FeatureGuard';

import { AdminFeature } from '@admin/consts/AdminConst';
import { ErrorNotificationDataType } from '@admin/interfaces/data/ErrorNotificationDataType';
import { ErrorNotificationFetchService } from '@/services/ErrorNotificationFetchService.client';
import BasicStack from '@client-common/components/Layout/Stacks/BasicStack';
import ContainedButton from '@client-common/components/inputs/Buttons/ContainedButton';

const fetchService = new ErrorNotificationFetchService();

const columns: Column<ErrorNotificationDataType>[] = [
    { id: 'id', label: 'ID' },
    { id: 'rootFeature', label: 'Root Feature' },
    { id: 'feature', label: 'Feature' },
    { id: 'message', label: 'Message' },
    { id: 'stack', label: 'Stack' }
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
            <BasicStack>
                <ContainedButton
                    label='Refresh'
                    onClick={fetchData}
                />
                <BasicTable
                    columns={columns}
                    data={errorList}
                />
            </BasicStack>
        </FeatureGuard>
    )
}
