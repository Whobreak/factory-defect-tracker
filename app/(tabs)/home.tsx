import { useEffect, useMemo, useState } from "react";
import { View, Text, Modal } from "react-native";
import { mockReports, currentUser, addReport, Report } from "~/lib/mock";

import HeaderBadge from "~/components/HeaderBadge";
import FloatingButton from "~/components/FloatingButton";
import ReportsList from "~/components/report/ReportsList";
import ReportFormModal from "~/components/report/ReportFormModal";
import { flushQueueIfOnline, subscribeQueueFlush } from "~/lib/offlineQueue";

export default function EmployeeHomeScreen() {
  const [reports, setReports] = useState<Report[]>(
    mockReports.filter((r) => r.userId === currentUser.id)
  );
  const [formVisible, setFormVisible] = useState(false);

  // bağlantı değişince kuyruk boşalt
  useEffect(() => {
    subscribeQueueFlush();
    flushQueueIfOnline();
  }, []);

  // istatistikler
  const todayISO = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  const { todayCount, totalCount } = useMemo(() => {
    const mine = mockReports.filter((r) => r.userId === currentUser.id);
    const tCount = mine.length;
    const dCount = mine.filter((r) => r.createdAt.slice(0, 10) === todayISO).length;
    return { todayCount: dCount, totalCount: tCount };
  }, [reports]);

  // ONLINE gönderim yolu (offline ise form tarafı kuyruğa ekliyor ve burası çağrılmaz)
  function handleSubmitOnline(values: {
    barcode: string;
    productType: string;
    lineNumber: string;
    errorCode: any;
    note?: string;
    photos: string[];
  }) {
    const newReport: Report = {
      id: Date.now(),
      barcode: values.barcode,
      productType: values.productType,
      lineNumber: values.lineNumber,
      errorCode: values.errorCode,
      note: values.note || "",
      photos: values.photos,
      createdAt: new Date().toISOString(),
      userId: currentUser.id,
    };
    addReport(newReport);
    setReports((prev) => [newReport, ...prev]);
    setFormVisible(false);
  }

  return (
    <View className="flex-1 bg-gray-100 p-4">
      <HeaderBadge name={currentUser.name} line={currentUser.line} />

      {/* İstatistik kartı */}
      <View className="bg-white rounded-2xl shadow p-4 mb-3">
        <Text className="text-gray-700">Bugünkü Raporlar: <Text className="font-bold">{todayCount}</Text></Text>
        <Text className="text-gray-700">Toplam Raporlar: <Text className="font-bold">{totalCount}</Text></Text>
        <Text className="text-gray-400 text-xs mt-1">Sadece admin düzenleyebilir.</Text>
      </View>

      <Text className="text-gray-600 mb-2">Son raporlar</Text>
      <ReportsList data={reports} onImagePress={() => {}} />

      <Modal visible={formVisible} transparent animationType="slide">
        <ReportFormModal
          initialLineNumber={currentUser.line}
          onCancel={() => setFormVisible(false)}
          onSubmitOnline={handleSubmitOnline}
        />
      </Modal>

      <FloatingButton onPress={() => setFormVisible(true)} />
    </View>
  );
}
