import { Table, TableRow, TableHeader } from '@/components/Common/Table';
import { currentDriver, Driver, setDriver } from '@/dataSources';

import { useAppDispatch, useAppSelector } from '@/store';
import React from 'react';
import { useSchemaList, useDataSourcePrimaryKeys } from '..';

export const AllPrimaryKeys = ({
  driver,
  currentDatasource,
}: {
  driver: Driver;
  currentDatasource: string;
}) => {
  const dispatch = useAppDispatch();
  React.useEffect(() => {
    if (currentDatasource) {
      dispatch({
        type: 'Data/UPDATE_CURRENT_DATA_SOURCE',
        source: currentDatasource,
      });
    }
    if (driver) {
      setDriver(driver);
    }
  }, [currentDatasource, dispatch, driver]);
  const source: string = useAppSelector((s) => s.tables.currentDataSource);

  const {
    data: schemas,
    isError,
    error,
  } = useSchemaList(
    {
      source,
      driver: currentDriver,
    },
    { retry: 0 }
  );
  const {
    data: primaryKeys,
    isLoading,
    isSuccess,
    isError: isError2,
    isIdle,
    error: fkError,
  } = useDataSourcePrimaryKeys(
    {
      schemas: schemas!,
      source,
      driver: currentDriver,
    },
    {
      enabled: !!schemas,
      retry: 0,
    }
  );
  const keys = React.useMemo(
    () => Object.keys(primaryKeys?.[0] ?? {}),
    [primaryKeys]
  );

  if (isError || isError2) {
    return (
      <p className="text-red-500">
        Error: {error?.message || fkError?.message}
      </p>
    );
  }

  if (isLoading || isIdle) {
    return <p>Loading...</p>;
  }

  return (
    <div>
      <h1 className="prose-xl">useDataSourcePrimaryKeys</h1>
      <p className="prose-lg mb-8">
        Primary Keys on <b>{schemas?.join(', ')}</b> schemas
      </p>
      {isSuccess && (
        <Table
          rowCount={primaryKeys?.length ?? 0}
          columnCount={keys?.length ?? 0}
        >
          <TableHeader headers={keys} />
          {primaryKeys?.map((fk, i) => {
            return (
              <TableRow
                entries={Object.values(fk)}
                index=""
                key={i}
                readonly
                renderCol={({ data }) =>
                  typeof data === 'string' ? data : JSON.stringify(data)
                }
              />
            );
          })}
        </Table>
      )}
    </div>
  );
};
