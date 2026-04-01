import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Svg,
  Path,
  Image,
} from "@react-pdf/renderer";
import type { IncidentReportData } from "@/types/pdf-report";
import path from "path";

// Register Thai font from local files
Font.register({
  family: "Sarabun",
  fonts: [
    {
      src: path.join(process.cwd(), "public/fonts/Sarabun-Regular.ttf"),
      fontWeight: 400,
    },
    {
      src: path.join(process.cwd(), "public/fonts/Sarabun-Bold.ttf"),
      fontWeight: 700,
    },
  ],
});

// Styles
const styles = StyleSheet.create({
  page: {
    fontFamily: "Sarabun",
    fontSize: 11,
    padding: "10mm 15mm",
    lineHeight: 1.3,
  },
  header: {
    textAlign: "center",
    marginBottom: 10,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: 700,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    marginBottom: 4,
  },
  headerFormType: {
    fontSize: 12,
    marginTop: 6,
  },
  section: {
    marginBottom: 8,
  },
  sectionNumber: {
    fontWeight: 700,
    fontSize: 11,
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    marginBottom: 2,
    flexWrap: "wrap",
  },
  label: {
    fontSize: 11,
  },
  value: {
    fontSize: 11,
    color: "#333",
  },
  separator: {
    marginHorizontal: 8,
  },
  subSection: {
    marginLeft: 10,
    marginTop: 4,
  },
  subSectionTitle: {
    fontWeight: 700,
    fontSize: 11,
    marginBottom: 2,
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 2,
  },
  checkbox: {
    width: 10,
    height: 10,
    border: "1pt solid #000",
    marginRight: 5,
  },
  checkboxChecked: {
    width: 10,
    height: 10,
    border: "1pt solid #000",
    marginRight: 5,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  checkmark: {
    fontSize: 9,
    fontFamily: "Sarabun",
    marginTop: -2,
  },
  incidentDetails: {
    minHeight: 40,
    marginTop: 4,
    padding: 5,
  },
  signatureSection: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 15,
  },
  signatureBlock: {
    flex: 1,
    textAlign: "center",
  },
  signatureLine: {
    borderBottom: "1pt solid #000",
    width: "80%",
    marginHorizontal: "auto",
    marginBottom: 4,
    paddingTop: 15,
  },
  note: {
    marginTop: 10,
    fontSize: 10,
    color: "#333",
    textAlign: "justify",
  },
  evidenceSection: {
    marginTop: 8,
    marginBottom: 8,
  },
  evidenceGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 4,
    marginTop: 4,
  },
  evidenceImage: {
    width: "48%",
    height: 140,
    objectFit: "contain",
    border: "1pt solid #ddd",
  },
});

// Case types for checkbox section
const caseTypes = [
  "คดีไม่เข้าข่ายตาม พ.ร.ก.",
  "หลอกลวงซื้อขายสินค้าหรือบริการ ที่ไม่มีลักษณะเป็นขบวนการ",
  "หลอกลวงเป็นบุคคลอื่นเพื่อยืมเงิน",
  "หลอกลวงให้รักแล้วโอนเงิน",
  "หลอกลวงให้โอนเงินเพื่อรับรางวัลหรือวัตถุประสงค์อื่นๆ",
  "หลอกลวงให้กู้เงินอันมีลักษณะฉ้อโกง กรรโชก หรือรีดเอาทรัพย์",
  "หลอกลวงให้โอนเงินเพื่อทำงานหารายได้พิเศษ",
  "ข่มขู่ทางโทรศัพท์ให้เกิดความกลัวและหลอกให้โอนเงิน",
  "หลอกลวงให้ติดตั้งโปรแกรมควบคุมระบบในโทรศัพท์",
  "หลอกลวงให้ลงทุนผ่านระบบคอมพิวเตอร์",
  "หลอกลวงเกี่ยวกับสินทรัพย์ดิจิทัล",
  "หลอกลวงซื้อขายสินค้าหรือบริการ ที่มีลักษณะเป็นกระบวนการ",
  "คดีอาชญากรรมทางเทคโนโลยีทางลักษณะอื่นๆ",
];

const CheckmarkIcon = () => (
  <Svg viewBox="0 0 24 24" width={8} height={8}>
    <Path
      d="M20.285 2l-11.285 11.567-5.286-5.011-3.714 3.716 9 8.728 15-15.285z"
      fill="#000"
    />
  </Svg>
);

interface Props {
  data: IncidentReportData;
}

export const IncidentReportDocument: React.FC<Props> = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          เอกสารรับแจ้งเหตุการกระทำผิดทางเทคโนโลยี
        </Text>
        <Text style={styles.headerSubtitle}>
          ศูนย์ตรวจสอบและวิเคราะห์การกระทำผิดทางเทคโนโลยี
        </Text>
        <Text style={styles.headerFormType}>
          (แบบฟอร์มรับเรื่องราวร้องทุกข์กรณีฉ้อโกงออนไลน์)
        </Text>
      </View>

      {/* Section 1: ข้อมูลผู้เสียหาย */}
      <View style={styles.section}>
        <Text style={styles.sectionNumber}>1. ข้อมูลผู้เสียหาย</Text>
        <View style={styles.row}>
          <Text style={styles.label}>ชื่อ-นามสกุล (นาย/นาง/นางสาว) </Text>
          <Text style={styles.value}>{data.fullname}</Text>
          <Text style={styles.separator}>|</Text>
          <Text style={styles.label}>อายุ </Text>
          <Text style={styles.value}>{data.age} ปี</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>เลขบัตรประชาชน </Text>
          <Text style={styles.value}>{data.id_card}</Text>
          <Text style={styles.separator}>|</Text>
          <Text style={styles.label}>เพศ </Text>
          <Text style={styles.value}>{data.gender}</Text>
          <Text style={styles.separator}>|</Text>
          <Text style={styles.label}>วัน/เดือน/ปีเกิด </Text>
          <Text style={styles.value}>{data.birth_date}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>เบอร์โทรศัพท์ </Text>
          <Text style={styles.value}>{data.phone}</Text>
          <Text style={styles.separator}>|</Text>
          <Text style={styles.label}>ค่ายโทรศัพท์ </Text>
          <Text style={styles.value}>{data.carrier}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Email </Text>
          <Text style={styles.value}>{data.email || "-"}</Text>
        </View>
      </View>

      {/* Section 2: ที่อยู่ */}
      <View style={styles.section}>
        <Text style={styles.sectionNumber}>
          2. ที่อยู่ตามบัตรประจำตัวประชาชน
        </Text>
        <Text style={styles.value}>{data.address}</Text>
        <View style={styles.subSection}>
          <Text style={styles.subSectionTitle}>ที่อยู่ปัจจุบันผู้เสียหาย</Text>
          <Text style={styles.value}>{data.current_address}</Text>
        </View>
      </View>

      {/* Section 3: การพบพนักงานสอบสวน */}
      <View style={styles.section}>
        <Text style={styles.sectionNumber}>
          3. ท่านเคยไปพบพนักงานสอบสวนในคดีนี้มาแล้วหรือไม่
        </Text>
        <View style={styles.checkboxRow}>
          <View style={data.met_investigator === false ? styles.checkboxChecked : styles.checkbox}>
            {data.met_investigator === false && <CheckmarkIcon />}
          </View>
          <Text>ยังไม่เคยพบ</Text>
        </View>
        <View style={styles.checkboxRow}>
          <View style={data.met_investigator === true ? styles.checkboxChecked : styles.checkbox}>
            {data.met_investigator === true && <CheckmarkIcon />}
          </View>
          <Text>เคยพบแล้ว</Text>
        </View>
        <Text style={{ marginTop: 6, marginBottom: 4 }}>
          กรุณาระบุหน่วยงานตำรวจที่ท่านสะดวกไปพบ
        </Text>
        <View style={styles.row}>
          <Text style={styles.label}>สถานีตำรวจ จังหวัด </Text>
          <Text style={styles.value}>{data.police_province || "-"}</Text>
          <Text style={styles.separator}>|</Text>
          <Text style={styles.label}>ชื่อสถานี </Text>
          <Text style={styles.value}>{data.station_name || "-"}</Text>
        </View>
      </View>

      {/* Section 4: ประเภทของเรื่อง */}
      <View style={styles.section}>
        <Text style={styles.sectionNumber}>4. ประเภทของเรื่อง</Text>
        {caseTypes.map((type, index) => (
          <View key={index} style={styles.checkboxRow}>
            <View style={type === data.case_type ? styles.checkboxChecked : styles.checkbox}>
              {type === data.case_type && <CheckmarkIcon />}
            </View>
            <Text style={{ fontSize: 10 }}>{type}</Text>
          </View>
        ))}
        <View style={{ marginTop: 10 }}>
          <Text style={styles.subSectionTitle}>รายละเอียดของการเกิดเหตุโดยย่อ</Text>
          <View style={styles.incidentDetails}>
            <Text style={styles.value}>{data.incident_details}</Text>
          </View>
        </View>
      </View>

      {/* Section 5: รายการทรัพย์สินที่เสียหาย */}
      <View style={styles.section}>
        <Text style={styles.sectionNumber}>5. รายการทรัพย์สินที่เสียหาย</Text>
        <View style={styles.row}>
          <Text style={styles.label}>ประเภททรัพย์สิน </Text>
          <Text style={styles.value}>{data.asset_type}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>รายละเอียดทรัพย์สิน </Text>
          <Text style={styles.value}>{data.asset_details}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>มูลค่า(บาท) </Text>
          <Text style={styles.value}>{data.asset_value}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>วัน เดือน ปี ที่มอบทรัพย์สินให้คนร้าย </Text>
          <Text style={styles.value}>{data.asset_date}</Text>
          <Text style={styles.separator}>|</Text>
          <Text style={styles.label}>เวลา </Text>
          <Text style={styles.value}>{data.asset_time}</Text>
        </View>
      </View>

      {/* Section 6: ช่องทางติดต่อคนร้าย */}
      <View style={styles.section}>
        <Text style={styles.sectionNumber}>
          6. ช่องทางติดต่อคนร้าย / รายละเอียดเกี่ยวกับคนร้าย
        </Text>

        {/* โทรศัพท์ */}
        <View style={styles.subSection}>
          <Text style={styles.subSectionTitle}>โทรศัพท์</Text>
          <View style={styles.row}>
            <Text style={styles.label}>หมายเลขโทรศัพท์ที่รับสาย </Text>
            <Text style={styles.value}>{data.received_phone || "-"}</Text>
            <Text style={styles.separator}>|</Text>
            <Text style={styles.label}>หมายเลขโทรศัพท์คนร้าย </Text>
            <Text style={styles.value}>{data.perpetrator_phone || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>วันเวลาที่คนร้ายติดต่อเข้ามา </Text>
            <Text style={styles.value}>{data.contact_datetime || "-"}</Text>
          </View>
        </View>

        {/* Social Media */}
        <View style={styles.subSection}>
          <Text style={styles.subSectionTitle}>Social Media</Text>
          <View style={styles.row}>
            <Text style={styles.label}>ประเภท Social Media </Text>
            <Text style={styles.value}>{data.social_media_type || "-"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Link / URL </Text>
            <Text style={styles.value}>{data.social_media_url || "-"}</Text>
          </View>
        </View>
      </View>

      {/* Section หลักฐานรูปภาพ (ถ้ามี) */}
      {data.evidence_images && data.evidence_images.length > 0 && (
        <View style={styles.evidenceSection}>
          <Text style={styles.sectionNumber}>8. รูปภาพหลักฐานที่แนบ</Text>
          <View style={styles.evidenceGrid}>
            {data.evidence_images.map((src, idx) => (
              // eslint-disable-next-line jsx-a11y/alt-text
              <Image key={idx} src={src} style={styles.evidenceImage} />
            ))}
          </View>
        </View>
      )}

      {/* Section 7: ลายเซ็น */}
      <View style={styles.section}>
        <Text style={styles.sectionNumber}>7. คำร้องขอจากผู้แจ้ง</Text>
        <View style={styles.signatureSection}>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine}>
              <Text style={{ textAlign: "center" }}>
                {data.victim_signature || ""}
              </Text>
            </View>
            <Text>(ผู้เสียหาย)</Text>
          </View>
          <View style={styles.signatureBlock}>
            <View style={styles.signatureLine}>
              <Text style={{ textAlign: "center" }}>
                {data.recipient_signature || ""}
              </Text>
            </View>
            <Text>(ผู้รับแจ้ง)</Text>
          </View>
          <View style={styles.signatureBlock}>
            <Text style={{ marginTop: 20 }}>
              วันที่ {data.report_date || ""}
            </Text>
          </View>
        </View>
      </View>

      {/* หมายเหตุ */}
      <View style={styles.note}>
        <Text>
          <Text style={{ fontWeight: 700 }}>หมายเหตุ:</Text>{" "}
          การแจ้งความออนไลน์
          เป็นการบันทึกข้อมูลเบื้องต้นเพื่อให้เจ้าหน้าที่ตรวจสอบ
          หากมีข้อมูลเพิ่มเติม
          ทางเจ้าหน้าที่จะติดต่อกลับผ่านช่องทางที่ให้ไว้
        </Text>
      </View>
    </Page>
  </Document>
);

export default IncidentReportDocument;
