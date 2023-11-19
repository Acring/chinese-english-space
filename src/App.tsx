import { FieldType, IFieldMeta, bitable } from "@lark-base-open/js-sdk";
import { Alert, Button, Form, Select } from "antd";
import pangu from "pangu";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

export default function App() {
  const { t } = useTranslation();

  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [textFieldList, setTextFieldList] = useState<IFieldMeta[]>([]);
  const [selectedFieldList, setSelectedFieldList] = useState<string[]>([]);

  useEffect(() => {
    const fn = async () => {
      const table = await bitable.base.getActiveTable();
      const tableFieldList = await table.getFieldMetaList();

      const textTypeFieldList = tableFieldList.filter(
        (fieldMeta) => fieldMeta.type === FieldType.Text,
      );
      setTextFieldList(textTypeFieldList);
    };

    fn();
  });

  const optimize = async () => {
    setLoading(true);

    setDone(false);
    const table = await bitable.base.getActiveTable();

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
    <div
      style={{
        padding: 8,
      }}
    >
      <Alert message={t("intro")} type="success" />
      <Form
        style={{
          marginTop: 20,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}
        layout="vertical"
      >
        <Form.Item label={t("field_range_select")}>
          <Select
            style={{
              width: "100%",
            }}
            placeholder={t("select_placeholder")}
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
        </Form.Item>
        <Button
          loading={loading}
          style={{
            width: "100%",
          }}
          onClick={optimize}
        >
          {done ? "✅" : "🦋"} {t("action")}
        </Button>
      </Form>
    </div>
  );
}
