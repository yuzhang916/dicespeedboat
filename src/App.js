import React from 'react';
import { Table, Form, Input, Button } from 'antd';

const cols = [
  {
    title: '类型',
    dataIndex: 'type',
    width: '25%',
    align: 'center'
  },
  {
    title: '西',
    dataIndex: 'xixi',
    width: '25%',
    editable: true,
    align: 'center',
    className: 'back-color'
  },
  {
    title: '妈',
    dataIndex: 'mother',
    width: '25%',
    editable: true,
    align: 'center',
    className: 'back-color1'
  },
  {
    title: '爸',
    dataIndex: 'father',
    width: '25%',
    editable: true,
    align: 'center',
    className: 'back-color2'
  }
]

const types = ['一','二','三','四','五','六','小计','35','葫芦','全','同','小顺','大顺','快艇','总计']

class App extends React.Component {

  constructor(props) {
    super(props)
    this.state = {
      data: []
    }
  }

  componentDidMount() {
    let data = []
    for(let i=0 ;i< types.length; i++) {
      data.push({
        id: i+1,
        type: types[i]
      })
    }
    this.setState({data})
  }

  handle35 = () => {
    let data = this.state.data;
    let xixi = 0, mother = 0, father = 0;
    for(let item of data) {
      if(item.type === '一' || item.type === '二' || item.type === '三' ||
        item.type === '四' || item.type === '五' || item.type === '六') {
        xixi += item.xixi?parseInt(item.xixi):0
        mother += item.mother?parseInt(item.mother):0
        father += item.father?parseInt(item.father):0
      }
    }
    for(let item of data) {
      if(item.type === '小计') {
        item.xixi = xixi
        item.mother = mother
        item.father = father
      }
      if(item.type === '35') {
        if(xixi>=63) {
          item.xixi = 35
        } else {
          item.xixi = 0
        }
        if(mother>=63) {
          item.mother = 35
        } else {
          item.mother = 0
        }
        if(father>=63) {
          item.father = 35
        } else {
          item.father = 0
        }
      }
    }
    this.setState({data})
  }

  handleSum = () => {
    let data = this.state.data;
    let xixi = 0, mother = 0, father = 0;
    for(let item of data) {
      if(item.type === '小计' || item.type === '总计') {
        continue;
      }
      xixi += item.xixi?parseInt(item.xixi):0
      mother += item.mother?parseInt(item.mother):0
      father += item.father?parseInt(item.father):0
    }
    for(let item of data) {
      if(item.type === '总计') {
        item.xixi = xixi
        item.mother = mother
        item.father = father
      }
    }
    this.setState({data})
  }

  handleSave = (row) => {
    const newData = [...this.state.data];
    const index = newData.findIndex(item => row.id === item.id);
    const item = newData[index];
    newData.splice(index, 1, {
      ...item,
      ...row,
    });
    this.setState({ data: newData });
  };

  renderRowClass = (record, index) => {
    if(record.type==='小计') {
      return 'table-row-enable'
    }
  }

  render() {
    const { data } = this.state;

    const columns = cols.map((col) => {
      if (!col.editable) {
        return col;
      }

      return {
        ...col,
        onCell: (record) => ({
          record,
          editable: col.editable,
          dataIndex: col.dataIndex,
          title: col.title,
          handleSave: this.handleSave,
        }),
      };
    });

    return (
      <React.Fragment>
        <Table
          bordered
          size="small"
          rowKey="id"
          components={{
              body: {
                  row: EditableRow,
                  cell: EditableCell,
              },
          }}
          columns={columns}
          dataSource={data}
          pagination={false}
          rowClassName={this.renderRowClass}
        />
        <div style={{width: '184px', marginTop: '6px', float: 'right'}}>
          <Button onClick={this.handle35}>一~六小计</Button>
          <Button onClick={this.handleSum} style={{marginLeft: '20px'}}>总计</Button>
        </div>
      </React.Fragment>
    );
  }
}

export default App;

//可编辑行定义
const EditableContext = React.createContext(null);

const EditableRow = ({ index, ...props }) => {
  const [form] = Form.useForm();
  return (
    <Form form={form} component={false}>
      <EditableContext.Provider value={form}>
        <tr {...props} style={{}}/>
      </EditableContext.Provider>
    </Form>
  );
};

const EditableCell = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  ...restProps
}) => {
  const [editing, setEditing] = React.useState(false);
  const inputRef = React.useRef(null);
  const form = React.useContext(EditableContext);
  React.useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    console.log(record)
    if(record.type==='35') {
      return;
    }
    setEditing(!editing);
    if(record.type==='小顺') {
      record[dataIndex] = 15
    }
    if(record.type==='大顺') {
      record[dataIndex] = 30
    }
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
      >
        <Input style={{ width: '100%'}} ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        style={{ minHeight: '10px' }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};