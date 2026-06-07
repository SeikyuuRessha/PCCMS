import { useQuery } from "@tanstack/react-query";
import { Camera, FileText, Loader2 } from "lucide-react";
import { useState } from "react";
import { Button, Tag } from "~/components/atoms";
import { Card, EmptyState, SummaryRow } from "~/components/molecules";
import { boardingApi } from "~/features/boarding/api/boardingApi";
import type { BoardingBookingResponse, BoardingStatus, CarePeriod } from "~/types/boarding";

const statusTone: Record<BoardingStatus, "green" | "amber" | "blue" | "red" | "default"> = {
    RESERVED: "amber",
    CHECKED_IN: "blue",
    IN_STAY: "blue",
    CHECKED_OUT: "green",
    CANCELLED: "red",
};

const periodLabel: Record<CarePeriod, string> = {
    MORNING: "Sáng",
    NOON: "Trưa",
    AFTERNOON: "Chiều",
};

function formatCurrency(value?: number) {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(
        value ?? 0
    );
}

function formatDateTime(value?: string) {
    if (!value) return "Chưa cập nhật";
    return new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" }).format(
        new Date(value)
    );
}

export function BoardingTrackingPage() {
    const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);

    const bookingsQuery = useQuery({
        queryKey: ["my-boarding-bookings"],
        queryFn: () => boardingApi.getMyBookings(),
    });

    const bookings = bookingsQuery.data?.content ?? [];
    const selectedBooking: BoardingBookingResponse | undefined =
        bookings.find((booking) => booking.id === selectedBookingId) ?? bookings[0];

    const careLogsQuery = useQuery({
        queryKey: ["boarding-care-logs", selectedBooking?.id],
        queryFn: () => boardingApi.getCareLogs(selectedBooking!.id),
        enabled: Boolean(selectedBooking?.id),
    });

    if (bookingsQuery.isLoading) {
        return (
            <div className="flex items-center gap-2 text-sm text-slate-500">
                <Loader2 className="h-4 w-4 animate-spin" /> Đang tải lịch sử lưu trú
            </div>
        );
    }

    if (bookingsQuery.isError) {
        return (
            <EmptyState title="Không thể tải lịch sử lưu trú" description="Vui lòng thử lại sau." />
        );
    }

    if (bookings.length === 0) {
        return (
            <EmptyState
                title="Chưa có booking lưu trú"
                description="Các yêu cầu đặt phòng của bạn sẽ xuất hiện tại đây."
            />
        );
    }

    return (
        <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
            <Card title="Booking lưu trú">
                <div className="space-y-3">
                    {bookings.map((booking) => (
                        <button
                            key={booking.id}
                            type="button"
                            onClick={() => setSelectedBookingId(booking.id)}
                            className={`w-full rounded-2xl border p-4 text-left transition ${
                                selectedBooking?.id === booking.id
                                    ? "border-primary-500 bg-primary-50"
                                    : "border-slate-200 hover:border-slate-300"
                            }`}
                        >
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <p className="font-semibold">{booking.petName}</p>
                                    <p className="mt-1 text-sm text-slate-500">
                                        {booking.bookingCode}
                                    </p>
                                </div>
                                <Tag tone={statusTone[booking.statusCode]}>
                                    {booking.statusCode}
                                </Tag>
                            </div>
                            <p className="mt-3 text-xs text-slate-500">
                                {formatDateTime(booking.expectedCheckinAt)} -{" "}
                                {formatDateTime(booking.expectedCheckoutAt)}
                            </p>
                        </button>
                    ))}
                </div>
            </Card>

            {selectedBooking && (
                <div className="space-y-6">
                    <Card
                        title="Chi tiết lưu trú"
                        right={
                            <Tag tone={statusTone[selectedBooking.statusCode]}>
                                {selectedBooking.statusCode}
                            </Tag>
                        }
                    >
                        <div className="grid gap-4 md:grid-cols-2">
                            <SummaryRow label="Thú cưng" value={selectedBooking.petName} />
                            <SummaryRow
                                label="Loại phòng"
                                value={selectedBooking.requestedRoomTypeName}
                            />
                            <SummaryRow
                                label="Phòng cụ thể"
                                value={
                                    selectedBooking.roomCode
                                        ? `${selectedBooking.roomCode} - ${selectedBooking.roomName}`
                                        : "Chờ nhân viên gán phòng"
                                }
                            />
                            <SummaryRow
                                label="Tạm tính"
                                value={formatCurrency(selectedBooking.estimatedPriceVnd)}
                            />
                            <SummaryRow
                                label="Nhận phòng"
                                value={formatDateTime(
                                    selectedBooking.actualCheckinAt ??
                                        selectedBooking.expectedCheckinAt
                                )}
                            />
                            <SummaryRow
                                label="Trả phòng"
                                value={formatDateTime(
                                    selectedBooking.actualCheckoutAt ??
                                        selectedBooking.expectedCheckoutAt
                                )}
                            />
                        </div>
                        {selectedBooking.invoice && (
                            <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 p-4">
                                <div className="flex items-center gap-2 font-semibold text-amber-900">
                                    <FileText className="h-4 w-4" /> Hóa đơn chờ thanh toán
                                </div>
                                <div className="mt-3 grid gap-3 text-sm md:grid-cols-3">
                                    <SummaryRow
                                        label="Mã HĐ"
                                        value={selectedBooking.invoice.invoiceCode}
                                    />
                                    <SummaryRow
                                        label="Trạng thái"
                                        value={selectedBooking.invoice.statusCode}
                                    />
                                    <SummaryRow
                                        label="Tổng tiền"
                                        value={formatCurrency(
                                            selectedBooking.invoice.totalAmountVnd
                                        )}
                                    />
                                </div>
                            </div>
                        )}
                    </Card>

                    <Card
                        title="Nhật ký chăm sóc"
                        right={<Camera className="h-5 w-5 text-slate-400" />}
                    >
                        {careLogsQuery.isLoading ? (
                            <div className="flex items-center gap-2 text-sm text-slate-500">
                                <Loader2 className="h-4 w-4 animate-spin" /> Đang tải nhật ký
                            </div>
                        ) : careLogsQuery.isError ? (
                            <EmptyState
                                title="Không thể tải nhật ký"
                                description="Vui lòng thử lại sau."
                            />
                        ) : careLogsQuery.data?.length === 0 ? (
                            <EmptyState
                                title="Chưa có nhật ký"
                                description="Nhân viên sẽ cập nhật trong quá trình lưu trú."
                            />
                        ) : (
                            <div className="space-y-4">
                                {careLogsQuery.data?.map((log) => (
                                    <div
                                        key={log.id}
                                        className="rounded-2xl border border-slate-200 p-4"
                                    >
                                        <div className="flex items-start justify-between gap-3">
                                            <div>
                                                <h4 className="font-semibold">
                                                    {new Intl.DateTimeFormat("vi-VN").format(
                                                        new Date(log.logDate)
                                                    )}{" "}
                                                    - {periodLabel[log.periodCode]}
                                                </h4>
                                                <p className="mt-1 text-sm text-slate-500">
                                                    Ăn uống: {log.feedingStatus} | Vệ sinh:{" "}
                                                    {log.hygieneStatus}
                                                </p>
                                                {log.healthNote && (
                                                    <p className="mt-2 text-sm text-slate-600">
                                                        Sức khỏe: {log.healthNote}
                                                    </p>
                                                )}
                                                {log.staffNote && (
                                                    <p className="mt-1 text-sm text-slate-600">
                                                        Ghi chú: {log.staffNote}
                                                    </p>
                                                )}
                                            </div>
                                            <Tag tone="blue">{log.staffName}</Tag>
                                        </div>
                                        {log.media.length > 0 && (
                                            <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                                {log.media.map((media) => (
                                                    <img
                                                        key={media.id}
                                                        src={media.url}
                                                        alt={media.caption || "Care log"}
                                                        className="h-32 w-full rounded-2xl object-cover"
                                                    />
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </Card>

                    <Button variant="outline" onClick={() => bookingsQuery.refetch()}>
                        Tải lại
                    </Button>
                </div>
            )}
        </div>
    );
  }

  if (stays.length === 0) {
    return (
      <EmptyState
        title="Thú cưng đang lưu trú"
        description={PET_MESSAGES.noBoardingPets}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold tracking-tight">Thú cưng đang lưu trú</h2>
        <p className="text-sm text-slate-500">Theo dõi nhật ký chăm sóc hàng ngày tại trung tâm</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => setPetFilter('')}
          className={`rounded-full px-4 py-1.5 text-sm ${
            petFilter === '' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
          }`}
        >
          Tất cả
        </button>
        {stays.map((stay) => (
          <button
            key={stay.petId}
            type="button"
            onClick={() => setPetFilter(stay.petId)}
            className={`rounded-full px-4 py-1.5 text-sm ${
              petFilter === stay.petId ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-700'
            }`}
          >
            {stay.petName}
          </button>
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <Card title="Nhật ký lưu trú">
          {logsLoading && (
            <div className="flex justify-center py-8">
              <div className="h-6 w-6 animate-spin rounded-full border-b-2 border-indigo-600" />
            </div>
          )}

          {!logsLoading && careLogs.length === 0 && (
            <p className="py-8 text-center text-sm text-slate-500">
              Chưa có nhật ký chăm sóc cho bộ lọc này.
            </p>
          )}

          {!logsLoading && careLogs.length > 0 && (
            <div className="space-y-3">
              {careLogs.map((log) => (
                <button
                  key={log.id}
                  type="button"
                  onClick={() => setSelectedLogId(log.id)}
                  className={`w-full rounded-3xl border p-4 text-left transition hover:border-slate-300 hover:shadow-sm ${
                    selectedLog?.id === log.id ? 'border-emerald-300 bg-emerald-50/50' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h4 className="font-semibold">{formatLogTitle(log)}</h4>
                      <p className="mt-1 text-sm text-slate-500">
                        {log.petName} — Ăn: {log.feedingStatus} • Vệ sinh: {log.hygieneStatus}
                      </p>
                      {log.mediaCaptions.length > 0 && (
                        <p className="mt-2 text-xs text-slate-500">
                          {log.mediaCaptions.length} tệp đính kèm
                        </p>
                      )}
                    </div>
                    <Tag tone="blue">Nhật ký</Tag>
                  </div>
                </button>
              ))}
            </div>
          )}
        </Card>

        <Card title="Chi tiết nhật ký">
          {!selectedLog ? (
            <p className="py-8 text-center text-sm text-slate-500">
              Chọn một mục nhật ký bên trái để xem chi tiết.
            </p>
          ) : (
            <>
              <p className="mb-4 text-sm text-slate-500">
                {selectedLog.petName} — {formatLogTitle(selectedLog)}
              </p>

              {selectedLog.mediaCaptions.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-3">
                  {selectedLog.mediaCaptions.map((caption) => (
                    <div
                      key={caption}
                      className="flex h-36 items-center justify-center rounded-3xl bg-linear-to-br from-amber-100 to-orange-50 text-xs text-slate-500"
                    >
                      {caption}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="h-36 rounded-3xl bg-linear-to-br from-amber-100 to-orange-50" />
                  <div className="h-36 rounded-3xl bg-linear-to-br from-sky-100 to-cyan-50" />
                  <div className="h-36 rounded-3xl bg-linear-to-br from-emerald-100 to-lime-50" />
                </div>
              )}

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Tình trạng ăn uống</p>
                  <p className="mt-1 font-semibold">{selectedLog.feedingStatus}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-4">
                  <p className="text-sm text-slate-500">Tình trạng vệ sinh</p>
                  <p className="mt-1 font-semibold">{selectedLog.hygieneStatus}</p>
                </div>
              </div>

              {selectedLog.healthNote && (
                <div className="mt-4 rounded-3xl bg-amber-50 p-4 text-sm text-amber-900">
                  Ghi chú sức khỏe: {selectedLog.healthNote}
                </div>
              )}

              {selectedLog.staffNote && (
                <div className="mt-4 rounded-3xl bg-emerald-50 p-4 text-sm text-emerald-900">
                  Ghi chú của nhân viên: {selectedLog.staffNote}
                </div>
              )}
            </>
          )}
        </Card>
      </div>
    </div>
  );
}
