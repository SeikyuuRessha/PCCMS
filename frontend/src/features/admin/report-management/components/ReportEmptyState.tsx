import { EmptyState } from "~/components/molecules";

export function ReportEmptyState() {
    return (
        <EmptyState
            title="Không có dữ liệu thống kê trong khoảng thời gian được chọn"
            description="Hãy thay đổi tiêu chí hoặc khoảng thời gian để xem dữ liệu mock khác."
        />
    );
}
