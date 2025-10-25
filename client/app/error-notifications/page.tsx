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
import BasicDialog from '@client-common/components/feedback/dialog/BasicDialog';
import DirectionStack from '@client-common/components/Layout/Stacks/DirectionStack';
import BasicTextField from '@client-common/components/inputs/TextFields/BasicTextField';
import MultilineTextField from '@client-common/components/inputs/TextFields/MultilineTextField';

interface ErrorNotificationTableColumn extends ErrorNotificationDataType {
    action: React.ReactNode;
}

const fetchService = new ErrorNotificationFetchService();

const columns: Column<ErrorNotificationTableColumn>[] = [
    { id: 'rootFeature', label: 'Root Feature' },
    { id: 'feature', label: 'Feature' },
    { id: 'message', label: 'Message' },
    { id: 'create', label: 'Create', format: (value) => new Date(value).toLocaleString() },
    { id: 'action', label: 'Action', format: (value) => <>{value}</> },
]

export default function ErrorNotificationsPage() {
    const [errorList, setErrorList] = useState<ErrorNotificationTableColumn[]>([]);
    const [error, setError] = useState<ErrorNotificationDataType | null>(null);
    const [detailDialogOpen, setDetailDialogOpen] = useState(false);

    const itemToTable = (item: ErrorNotificationDataType): ErrorNotificationTableColumn => {
        return {
            ...item,
            action: (
                <DirectionStack>
                    <ContainedButton label='Detail' onClick={() => onDetailClick(item)} />
                </DirectionStack>
            )
        };
    };

    const onDetailClick = (item: ErrorNotificationDataType) => {
        setError(item);
        setDetailDialogOpen(true);
    };

    const fetchData = async () => {
        const data = await fetchService.get();
        setErrorList(data.map(itemToTable));
    };

    useEffect(() => {
        (async () => {
            await fetchData();
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <FeatureGuard
            feature={AdminFeature.ERROR_NOTIFICATION}
            level={PermissionLevel.VIEW}
        >
            <LoadingContent>
                {(loading, runWithLoading) => (
                    <>
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
                        <BasicDialog
                            open={detailDialogOpen}
                            title="Error Details"
                            onClose={() => setDetailDialogOpen(false)}
                            closeText='Close'
                            paperProps={{ sx: { minWidth: '80%' } }}
                        >
                            {() => (
                                <BasicStack>
                                    <BasicTextField
                                        label='Root Feature'
                                        value={error?.rootFeature}
                                        readonly={true}
                                    />
                                    <BasicTextField
                                        label='Feature'
                                        value={error?.feature}
                                        readonly={true}
                                    />
                                    <BasicTextField
                                        label='Message'
                                        value={error?.message}
                                        readonly={true}
                                    />
                                    <MultilineTextField
                                        label='Stack'
                                        value={error?.stack}
                                        readonly={true}
                                    />
                                    <MultilineTextField
                                        label='Analyze Result'
                                        value={error?.analyzeResult || 'N/A'}
                                        readonly={true}
                                    />
                                </BasicStack>
                            )}
                        </BasicDialog>
                    </>
                )}
            </LoadingContent>
        </FeatureGuard>
    )
}
