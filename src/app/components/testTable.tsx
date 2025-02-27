import React, { useEffect, useState } from 'react';
import type { TableProps } from 'antd';
import { DatePicker, Form, Input, InputNumber, message, Space, Button, Table, Typography } from 'antd';
const { Text } = Typography;
import dayjs from 'dayjs';
import { Dayjs } from 'dayjs';
import TransactionFormDrawer from './drawer';
export const dynamic = 'force-dynamic';
interface DataType {
  key: string;
  particular: string;
  am: number | string;
  mid: number | string;
  pm: number | string;
  gross_total: number;
  net_total:number;
}


interface EditableCellProps extends React.HTMLAttributes<HTMLElement> {
  editing: boolean;
  dataIndex: string;
  title: string;
  inputType: 'number' | 'text';
  record: DataType;
  index: number;
}

const EditableCell: React.FC<React.PropsWithChildren<EditableCellProps>> = ({
  editing,
  dataIndex,
  title,
  inputType,
  children,
  ...restProps
}) => {
  const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;

  return (
    <td {...restProps}>
      {editing ? (
        <Form.Item
          name={dataIndex}
          style={{ margin: 0 }}
          rules={[
            {
              required: true,
              message: `Please Input ${title}!`,
            },
          ]}
        >
          {inputNode}
        </Form.Item>
      ) : (
        children
      )}
    </td>
  );
};

const TestTable: React.FC = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState<DataType[]>([]);
// const [editingKey,] = useState('');
  const [currentDate, setCurrentDate] = useState<Dayjs>(dayjs());
  const [loading, setLoading] = useState<boolean>(false);
  const [messageApi,] = message.useMessage();
// Use useEffect for initial load and date changes
  useEffect(() => {
    fetchData(currentDate);
  }, [currentDate]);

  const fetchData = async (dateInput=dayjs()) => {
    try{
        setLoading(true);
        const response = await fetch('/api/transactions/getTransactionByDay', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date: dateInput })
        })
        if(!response.ok) throw new Error('Failed to fetch transactions');
        const data = await response.json();
        console.log('Transaction Data Retrieved: ', data);
        setData(data.data);
    } catch (error) {
        console.error('Fetch error:', error);
        console.error(loading);
    } finally {
        setLoading(false);
    }
    
  };
//   if(!isMounted){
//     fetchData(currentDate);
//     setIsMounted(true);
//   }
 
  const onChangeDate = (date: Dayjs) => {
    if (date) {
        setCurrentDate(date)
        console.log('Date: ', date);
        fetchData(currentDate);
    } else {
        console.log('Clear');
    }
  };
  const CustomDatePicker = () => (
    <DatePicker
        onChange={onChangeDate}
        defaultValue={currentDate}
        presets={[
            { label: 'Yesterday', value: dayjs().add(-1, 'd') },
            { label: 'Last Week', value: dayjs().add(-7, 'd') },
            { label: 'Last Month', value: dayjs().add(-1, 'month') },
        ]}
    />
  );
  type NotificationType = 'success' | 'info' | 'warning' | 'error';
  const handleTransactionProcess = async(type: NotificationType, message:string) => {
    messageApi.open({
        type:type,
        content: message
    });
    console.log("TYPE:", type);
    if(type==='success'){
        console.log("SUCCESS")
        fetchData(currentDate);
    }
  };

  // const isEditing = (record: DataType) => record.key === editingKey;

//   const edit = (record: Partial<DataType> & { key: React.Key }) => {
//     form.setFieldsValue({ name: '', am: '', mid: '', ...record });
//     setEditingKey(record.key);
//   };

//   const cancel = () => {
//     setEditingKey('');
//   };

//   const save = async (key: React.Key) => {
//     try {
//       const row = (await form.validateFields()) as DataType;

//       const newData = [...data];
//       const index = newData.findIndex((item) => key === item.key);
//       if (index > -1) {
//         const item = newData[index];
//         newData.splice(index, 1, {
//           ...item,
//           ...row,
//         });
//         setData(newData);
//         setEditingKey('');
//       } else {
//         newData.push(row);
//         setData(newData);
//         setEditingKey('');
//       }
//     } catch (errInfo) {
//       console.log('Validate Failed:', errInfo);
//     }
//   };

  const columns = [
    {
      title: 'PARTICULARS',
      dataIndex: 'particular',
      width: '25%',
      editable: true,
    },
    {
      title: 'AM',
      dataIndex: 'am',
      width: '15%',
      editable: true,
      render:(_: unknown, record: DataType)=>(
        <>
          {(record.particular.startsWith('GRAND') || record.particular.startsWith('SUB TOTAL') /*|| record.particular.startsWith('CASHIER')*/) ? (<Text strong>{record.am}</Text>) : (<Text>{record.am}</Text>)}
        </>
      )
    },
    {
      title: 'MID',
      dataIndex: 'mid',
      width: '15%',
      editable: true,
      render:(_: unknown, record: DataType)=>(
        <>
          {(record.particular.startsWith('GRAND') || record.particular.startsWith('SUB TOTAL') /*|| record.particular.startsWith('CASHIER')*/) ? (<Text strong>{record.mid}</Text>) : (<Text>{record.mid}</Text>)}
        </>
      ),
      
    },
    {
        title: 'PM',
        dataIndex: 'pm',
        width: '15%',
        editable: true,
        render:(_: unknown, record: DataType)=>(
            <>
              {(record.particular.startsWith('GRAND') || record.particular.startsWith('SUB TOTAL') /*|| record.particular.startsWith('CASHIER')*/) ? (<Text strong>{record.pm}</Text>) : (<Text>{record.pm}</Text>)}
            </>
          )
    },
    {
        title: 'GROSS TOTAL',
        dataIndex: 'gross_total',
        width: '18%',
        editable: false,
        render:(_: unknown, record: DataType)=>(
            <>
                {(<Text strong>{record.gross_total}</Text>)}
            </>
        )
    },
    {
        title: 'NET TOTAL',
        dataIndex: 'net_total',
        width: '18%',
        editable: false,
        render:(_: unknown, record: DataType)=>(
            <>
              {(<Text strong>{record.net_total}</Text>)}
            </>
        )
    },
    // {
    //   title: 'operation',
    //   dataIndex: 'operation',
    //   render: (_: unknown, record: DataType) => {
    //     const editable = isEditing(record);
    //     return editable ? (
    //       <span>
    //         <Typography.Link onClick={() => save(record.key)} style={{ marginInlineEnd: 8 }}>
    //           Save
    //         </Typography.Link>
    //         <Popconfirm title="Sure to cancel?" onConfirm={cancel}>
    //           <a>Cancel</a>
    //         </Popconfirm>
    //       </span>
    //     ) : (
    //       <Typography.Link disabled={editingKey !== ''} onClick={() => edit(record)}>
    //         Edit
    //       </Typography.Link>
    //     );
    //   },
    // },
  ];


  const mergedColumns: TableProps<DataType>['columns'] = columns.map((col) => {
    if (!col.editable) {
      return col;
    }
    return {
      ...col,
      onCell: (record: DataType) => ({
        record,
        inputType: col.dataIndex === 'am' ? 'number' : 'text',
        dataIndex: col.dataIndex,
        title: col.title,
        // editing: isEditing(record) && (!record.particular.startsWith('SUB TOTAL') && !record.particular.startsWith('CASHIER') && !record.particular.startsWith('GRAND TOTAL')),
        
      }),
    };
  });
  

  return (
    <Form form={form} component={false}>
      <Table<DataType>
        components={{
          body: { cell: EditableCell },
        }}
        bordered
        dataSource={data}
        title={() => 
          <Space style={{ width: "100%", display: "flex", justifyContent: "space-between" }}>
          {/* Left Section */}
          <Space>
            <CustomDatePicker />
            <TransactionFormDrawer onSubmit={handleTransactionProcess} selectedDate={currentDate} />
          </Space>
        
          {/* Right Section */}
          <Button>Export</Button>
        </Space>}
        columns={mergedColumns}
        rowClassName="editable-row"
        pagination={false}
        size="middle"
        scroll={{ y: 105 * 5 }}
      />
    </Form>
  );
};


export default TestTable;