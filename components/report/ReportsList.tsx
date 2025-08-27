import React from "react";
import { FlatList } from "react-native";
import { Report } from "~/lib/mock";
import ReportCard from "~/components/ReportCard";

type Props = {
  data: Report[];
  onImagePress?: (uri: string) => void;
};

export default function ReportsList({ data, onImagePress }: Props) {
  return (
    <FlatList
      data={data}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <ReportCard report={item} onImagePress={onImagePress || (() => {})} />
      )}
    />
  );
}
