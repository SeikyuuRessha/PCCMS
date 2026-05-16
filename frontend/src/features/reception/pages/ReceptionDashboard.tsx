import { Building2, CalendarDays, ClipboardCheck, Sparkles } from "lucide-react";
import { Tag } from "~/components/atoms";
import { Card, DataTable, MiniGridStats } from "~/components/molecules";
import { today, useReceptionMockData } from "../mockReceptionData";

const appointmentTone = (status: string) => {
    if (status === "Đang chờ khám") return "blue" as const;
    if (status === "Đã hủy") return "red" as const;
    return "amber" as const;
};

export function ReceptionDashboard() {
    const { appointments, groomingTickets, boardingPets, boardingLogs } = useReceptionMockData();

    const waitingAppointments = appointments.filter((item) => item.status === "Chờ tiếp nhận").length;
    const activeBoardingPets = boardingPets.filter((pet) => pet.status === "Đang lưu trú" || pet.status === "Sắp đón").length;
    const todaySavedLogs = boardingLogs.filter((log) => log.date === today && log.status === "Đã lưu").length;
    const processingGrooming = groomingTickets.filter((ticket) => ticket.status === "Đang dùng dịch vụ").length;

    return (
        <div className="space-y-6">
            <MiniGridStats
                items={[
                    { label: "Lịch hẹn hôm nay", value: String(appointments.length), hint: `${waitingAppointments} lịch đang chờ tiếp nhận`, icon: CalendarDays },
                    { label: "Spa trong ngày", value: String(groomingTickets.length), hint: `${processingGrooming} thú cưng đang dùng dịch vụ`, icon: Sparkles },
                    { label: "Đang lưu trú", value: String(activeBoardingPets), hint: `${activeBoardingPets} thú cưng đang lưu trú hoặc sắp đón`, icon: Building2 },
                    { label: "Nhật ký hôm nay", value: String(todaySavedLogs), hint: `${todaySavedLogs} bản ghi lưu trú đã lưu`, icon: ClipboardCheck },
                ]}
            />
            <Card title="Bảng điều phối nhanh" subtitle="Tổng hợp nhanh các ca đang có trong các màn hình nghiệp vụ của nhân viên trung tâm.">
                <DataTable
                    columns={["Khung giờ", "Khách", "Thú cưng", "Dịch vụ", "Trạng thái"]}
                    rows={appointments.map((appointment) => [
                        appointment.time,
                        appointment.customerName,
                        appointment.petName,
                        appointment.service,
                        <Tag key={`${appointment.id}-status`} tone={appointmentTone(appointment.status)}>
                            {appointment.status}
                        </Tag>,
                    ])}
                />
            </Card>
        </div>
    );
}
