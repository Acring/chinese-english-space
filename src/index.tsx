import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import {
  bitable,
  FieldType,
  IAttachmentField,
  IFieldMeta,
} from "@lark-base-open/js-sdk";
import { Alert, AlertProps, Button, Select } from "antd";
import pangu from "pangu";

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <LoadApp />
  </React.StrictMode>,
);

function LoadApp() {
  const [initial, setInitial] = useState(true);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [info, setInfo] = useState("正在获取表格信息...");
  const [alertType, setAlertType] = useState<AlertProps["type"]>("info");
  const [textFieldList, setTextFieldList] = useState<IFieldMeta[]>([]);
  const [selectedFieldList, setSelectedFieldList] = useState<string[]>([]);
  useEffect(() => {
    const fn = async () => {
      const table = await bitable.base.getActiveTable();
      const tableFieldList = await table.getFieldMetaList();
      const textTypeFieldList = tableFieldList.filter(
        (fieldMeta) => fieldMeta.type === FieldType.Text,
      );
      setInitial(false);
      setTextFieldList(textTypeFieldList);
      setInfo("🦋 一键将挤到一起的中英文，数字，符号分开 :)");
      setAlertType("success");
    };
    fn();
  }, []);

  const optimize = async () => {
    setLoading(true);

    setDone(false);
    const table = await bitable.base.getActiveTable();
    const fieldMetaList = await table.getFieldMetaList();

    const _selectedFieldList =
      selectedFieldList.length === 0
        ? textFieldList.map((item) => item.id)
        : selectedFieldList;
    const recordIdList = await table.getRecordIdList();

    for (let i = 0; i < recordIdList.length; i++) {
      for (let j = 0; j < _selectedFieldList.length; j++) {
        const value = await table.getCellString(
          _selectedFieldList[j],
          recordIdList[i],
        );
        const result = pangu.spacing(value);
        table.setCellValue(_selectedFieldList[j], recordIdList[i], result);
      }
    }
    setLoading(false);
    setDone(true);
  };

  return (
    <div>
      {initial && <Alert message={info} type={alertType} />}
      {!initial && (
        <>
          <Alert message={info} type={alertType} />
          <div
            style={{
              marginTop: 20,
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            <span> 选择要美化的字段 </span>
            <Select
              style={{
                width: "100%",
              }}
              placeholder="默认全选"
              options={textFieldList.map((item) => ({
                label: item.name,
                value: item.id,
              }))}
              value={selectedFieldList}
              onChange={(value) => {
                setSelectedFieldList(value);
              }}
              defaultValue={[]}
              mode="multiple"
            ></Select>
            <Button
              loading={loading}
              style={{
                width: "100%",
              }}
              onClick={optimize}
            >
              {done ? "✅" : "🦋"} 空格美化
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
