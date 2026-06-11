package com.astral.express.pccms.appointment.service;

import com.astral.express.pccms.appointment.dto.request.CreateBoardingBookingRequest;
import com.astral.express.pccms.appointment.dto.request.CreateGroomingAppointmentRequest;
import com.astral.express.pccms.appointment.dto.request.CreateMedicalAppointmentRequest;
import com.astral.express.pccms.appointment.dto.request.QuickCheckInRequest;
import com.astral.express.pccms.appointment.dto.request.UpdateGroomingStatusRequest;
import com.astral.express.pccms.appointment.dto.response.AppointmentResponse;
import com.astral.express.pccms.appointment.dto.response.AvailabilitySummaryResponse;
import com.astral.express.pccms.appointment.dto.response.BoardingBookingResponse;
import com.astral.express.pccms.appointment.dto.response.CustomerLookupResponse;
import com.astral.express.pccms.appointment.dto.response.GroomingBoardCardResponse;
import com.astral.express.pccms.appointment.dto.response.QueueEntryResponse;
import com.astral.express.pccms.appointment.dto.response.RoomTypeOptionResponse;
import com.astral.express.pccms.appointment.dto.response.ServiceCatalogOptionResponse;
import com.astral.express.pccms.appointment.dto.response.TimeSlotResponse;
import com.astral.express.pccms.appointment.dto.response.VetOptionResponse;
import com.astral.express.pccms.appointment.entity.*;
import com.astral.express.pccms.appointment.repository.*;
import com.astral.express.pccms.boarding.entity.BoardingBooking;
import com.astral.express.pccms.boarding.repository.BoardingBookingRepository;
import com.astral.express.pccms.room.repository.RoomTypeRepository;
import com.astral.express.pccms.room.entity.RoomType;
import com.astral.express.pccms.common.dto.PageResponse;
import com.astral.express.pccms.common.exception.BusinessException;
import com.astral.express.pccms.common.exception.ErrorCode;
import com.astral.express.pccms.pet.entity.Pets;
import com.astral.express.pccms.pet.repository.PetRepository;
import com.astral.express.pccms.user.entity.Users;
import com.astral.express.pccms.user.repository.UserRepository;
import com.astral.express.pccms.boarding.service.BoardingService;
import com.astral.express.pccms.grooming.service.GroomingService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.*;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AppointmentServiceFacade {
    private static final LocalTime CLINIC_OPEN = LocalTime.of(8, 0);
    private static final LocalTime CLINIC_CLOSE = LocalTime.of(17, 0);
    private static final int DEFAULT_SLOT_MINUTES = 30;
    private static final String MEDICAL_SERVICE_CODE = "MED-GENERAL";
    private static final String VET_ROLE = "VETERINARIAN";

    private final AppointmentRepository appointmentRepository;
    private final ServiceCatalogRepository serviceCatalogRepository;
    private final GroomingTicketRepository groomingTicketRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final BoardingBookingRepository boardingBookingRepository;
    private final PetRepository petRepository;
    private final UserRepository userRepository;
    private final AppointmentResponseAssembler assembler;
    private final AppointmentReceptionService receptionService;
    private final AppointmentAvailabilityService availabilityService;
    private final VetAvailabilityChecker vetAvailabilityChecker;
    private final RoomAvailabilityChecker roomAvailabilityChecker;
    private final CreateMedicalAppointmentUseCase createMedicalAppointmentUseCase;
    private final GroomingService groomingService;
    private final BoardingService boardingService;
    private final QuickCheckInUseCase quickCheckInUseCase;

    @Transactional
    public AppointmentResponse createMedicalAppointment(CreateMedicalAppointmentRequest request, UUID ownerId) {
        Appointment saved = createMedicalAppointmentUseCase.createMedicalAppointment(request, ownerId);
        return assembler.toResponse(saved, null);
    }
 
     @Transactional(readOnly = true)
     public AppointmentResponse getAppointmentById(UUID appointmentId) {
         Appointment appointment = findAppointmentOrThrow(appointmentId);
         return assembler.toResponse(appointment, receptionService.getQueueNumberForAppointment(appointmentId));
     }

     @Transactional(readOnly = true)
     public PageResponse<AppointmentResponse> listOwnerAppointments(UUID ownerId, Pageable pageable) {
        Page<Appointment> page = appointmentRepository.findByOwnerId(ownerId, pageable);
        return PageResponse.of(page.map(a -> assembler.toResponse(a, receptionService.getQueueNumberForAppointment(a.getId()))));
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> listTodayAppointments(
            LocalDate date, AppointmentStatus status, String phone, String customerName) {
        LocalDate targetDate = date != null ? date : ClinicDateTime.today();
        OffsetDateTime dayStart = ClinicDateTime.startOfDay(targetDate);
        OffsetDateTime dayEnd = ClinicDateTime.endOfDay(targetDate);

        String phoneNeedle = phone != null && !phone.isBlank() ? normalizePhone(phone) : null;
        String nameNeedle = customerName != null && !customerName.isBlank()
                ? customerName.trim().toLowerCase()
                : null;

        return appointmentRepository.findAppointmentsForDay(dayStart, dayEnd).stream()
                .filter(a -> status == null || a.getStatusCode() == status)
                .filter(a -> phoneNeedle == null || matchesPhone(a.getServiceOrder().getOwner().getPhone(), phoneNeedle))
                .filter(a -> nameNeedle == null || containsIgnoreCase(a.getServiceOrder().getOwner().getFullName(), nameNeedle))
                .map(a -> assembler.toResponse(a, receptionService.getQueueNumberForAppointment(a.getId())))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<TimeSlotResponse> getAvailableSlots(LocalDate date, UUID vetId) {
        if (date == null) {
            throw new BusinessException(ErrorCode.ERR_VALIDATION_FAILED);
        }
        if (date.isBefore(ClinicDateTime.today())) {
            throw new BusinessException(ErrorCode.ERR_APT_002_PAST_DATETIME);
        }
        int slotMinutes = resolveSlotMinutes();
        List<TimeSlotResponse> slots = new ArrayList<>();

        LocalTime cursor = CLINIC_OPEN;
        while (cursor.plusMinutes(slotMinutes).compareTo(CLINIC_CLOSE) <= 0) {
            LocalTime slotEnd = cursor.plusMinutes(slotMinutes);
            OffsetDateTime startAt = ClinicDateTime.toOffsetDateTime(date, cursor);
            OffsetDateTime endAt = ClinicDateTime.toOffsetDateTime(date, slotEnd);

            boolean available = !startAt.isBefore(ClinicDateTime.now())
                    && availabilityService.isSlotAvailable(startAt, endAt, vetId);
            slots.add(assembler.toTimeSlotResponse(cursor, slotEnd, available));
            cursor = slotEnd;
        }
        return slots;
    }

    @Transactional(readOnly = true)
    public List<VetOptionResponse> listAvailableVets(LocalDate date, LocalTime slotStart) {
        List<Users> vets = userRepository.findActiveByRoleCode(VET_ROLE);
        if (vets.isEmpty()) {
            return List.of();
        }

        int slotMinutes = resolveSlotMinutes();
        OffsetDateTime startAt = ClinicDateTime.toOffsetDateTime(date, slotStart);
        OffsetDateTime endAt = startAt.plusMinutes(slotMinutes);

        return vets.stream()
                .map(vet -> {
                    boolean onDuty = vetAvailabilityChecker.isVetOnDuty(date, slotStart, vet.getId());
                    boolean free = onDuty && vetAvailabilityChecker.isVetFree(vet.getId(), startAt, endAt);
                    return assembler.toVetOptionResponse(vet, free);
                })
                .sorted(Comparator.comparing(VetOptionResponse::available).reversed()
                        .thenComparing(VetOptionResponse::fullName))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<VetOptionResponse> listVetsOnDuty(LocalDate date) {
        if (date == null) {
            throw new BusinessException(ErrorCode.ERR_VALIDATION_FAILED);
        }
        List<Users> vets = userRepository.findActiveByRoleCode(VET_ROLE);
        if (vets.isEmpty()) {
            return List.of();
        }
        List<UUID> scheduledVetIds = vetAvailabilityChecker.findVetIdsOnDutyForDate(date);
        boolean useAllVets = scheduledVetIds.isEmpty();

        return vets.stream()
                .map(vet -> {
                    boolean onDuty = useAllVets || scheduledVetIds.contains(vet.getId());
                    return assembler.toVetOptionResponse(vet, onDuty);
                })
                .sorted(Comparator.comparing(VetOptionResponse::available).reversed()
                        .thenComparing(VetOptionResponse::fullName))
                .toList();
    }

    @Transactional(readOnly = true)
    public AvailabilitySummaryResponse getAvailabilitySummary(LocalDate date, LocalTime slotStart) {
        if (date == null) {
            throw new BusinessException(ErrorCode.ERR_VALIDATION_FAILED);
        }
        List<TimeSlotResponse> slots = getAvailableSlots(date, null);
        int availableSlots = (int) slots.stream().filter(TimeSlotResponse::available).count();
        int totalRooms = roomAvailabilityChecker.getTotalActiveRooms();
        int vetsOnDuty = (int) listVetsOnDuty(date).stream().filter(VetOptionResponse::available).count();

        Integer freeRoomsForSlot = null;
        Integer freeVetsForSlot = null;
        if (slotStart != null) {
            int slotMinutes = resolveSlotMinutes();
            OffsetDateTime startAt = ClinicDateTime.toOffsetDateTime(date, slotStart);
            OffsetDateTime endAt = startAt.plusMinutes(slotMinutes);
            freeRoomsForSlot = (int) roomAvailabilityChecker.countFreeRooms(startAt, endAt);
            freeVetsForSlot = (int) listAvailableVets(date, slotStart).stream()
                    .filter(VetOptionResponse::available)
                    .count();
        }

        return new AvailabilitySummaryResponse(
                totalRooms, vetsOnDuty, slots.size(), availableSlots, freeRoomsForSlot, freeVetsForSlot);
    }

    @Transactional
    public AppointmentResponse checkIn(UUID appointmentId, UUID staffId) {
        Appointment appointment = findAppointmentOrThrow(appointmentId);

        if (appointment.getStatusCode() == AppointmentStatus.CANCELLED) {
            throw new BusinessException(ErrorCode.ERR_APT_003_ALREADY_CANCELLED);
        }
        if (appointment.getStatusCode() == AppointmentStatus.CHECKED_IN
                || appointment.getStatusCode() == AppointmentStatus.IN_PROGRESS
                || appointment.getStatusCode() == AppointmentStatus.COMPLETED) {
            throw new BusinessException(ErrorCode.ERR_APT_004_ALREADY_CHECKED_IN);
        }

        Users staff = userRepository.findById(staffId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_ACC_002_USER_NOT_FOUND));
        Users vet = appointment.getAssignedStaff();
        if (vet == null) {
            throw new BusinessException(ErrorCode.ERR_APT_005_NO_VET_AVAILABLE);
        }

        appointment.setStatusCode(AppointmentStatus.CHECKED_IN);
        ServiceOrder order = appointment.getServiceOrder();
        order.setStatusCode(ServiceOrderStatus.CONFIRMED);
        order.setUpdatedBy(staffId);

        int nextQueue = receptionService.receiveAppointment(appointment, staff, vet);

        return assembler.toResponse(appointment, nextQueue);
    }

    @Transactional
    public AppointmentResponse startExam(UUID appointmentId, UUID vetId) {
        Appointment appointment = findAppointmentOrThrow(appointmentId);
        ensureMedicalAppointment(appointment);
        ensureAssignedVet(appointment, vetId);

        if (appointment.getStatusCode() == AppointmentStatus.COMPLETED
                || appointment.getStatusCode() == AppointmentStatus.IN_PROGRESS) {
            return assembler.toResponse(appointment, receptionService.getQueueNumberForAppointment(appointmentId));
        }
        if (appointment.getStatusCode() != AppointmentStatus.CHECKED_IN) {
            throw new BusinessException(ErrorCode.ERR_VALIDATION_FAILED);
        }

        OffsetDateTime now = ClinicDateTime.now();
        appointment.setStatusCode(AppointmentStatus.IN_PROGRESS);
        ServiceOrder order = appointment.getServiceOrder();
        order.setStatusCode(ServiceOrderStatus.IN_PROGRESS);
        if (order.getActualStartAt() == null) {
            order.setActualStartAt(now);
        }
        order.setUpdatedBy(vetId);

        return assembler.toResponse(appointment, receptionService.getQueueNumberForAppointment(appointmentId));
    }

    @Transactional
    public void completeMedicalAppointment(UUID appointmentId, UUID vetId) {
        if (appointmentId == null) {
            return;
        }

        Appointment appointment = findAppointmentOrThrow(appointmentId);
        ensureMedicalAppointment(appointment);
        ensureAssignedVet(appointment, vetId);

        if (appointment.getStatusCode() == AppointmentStatus.COMPLETED) {
            return;
        }
        if (appointment.getStatusCode() == AppointmentStatus.CANCELLED
                || appointment.getStatusCode() == AppointmentStatus.PENDING
                || appointment.getStatusCode() == AppointmentStatus.CONFIRMED) {
            throw new BusinessException(ErrorCode.ERR_VALIDATION_FAILED);
        }

        OffsetDateTime now = ClinicDateTime.now();
        appointment.setStatusCode(AppointmentStatus.COMPLETED);
        ServiceOrder order = appointment.getServiceOrder();
        order.setStatusCode(ServiceOrderStatus.COMPLETED);
        if (order.getActualStartAt() == null) {
            order.setActualStartAt(now);
        }
        order.setCompletedAt(now);
        order.setUpdatedBy(vetId);
    }

    @Transactional
    public AppointmentResponse cancel(UUID appointmentId, UUID actorId, boolean isStaff) {
        Appointment appointment = findAppointmentOrThrow(appointmentId);

        if (!isStaff && !appointment.getServiceOrder().getOwner().getId().equals(actorId)) {
            throw new BusinessException(ErrorCode.ERR_403_FORBIDDEN);
        }
        if (appointment.getStatusCode() == AppointmentStatus.CANCELLED) {
            throw new BusinessException(ErrorCode.ERR_APT_003_ALREADY_CANCELLED);
        }
        if (!isStaff && appointment.getStatusCode() != AppointmentStatus.PENDING) {
            throw new BusinessException(ErrorCode.ERR_APT_007_CANNOT_CANCEL);
        }
        if (isStaff && (appointment.getStatusCode() == AppointmentStatus.IN_PROGRESS
                || appointment.getStatusCode() == AppointmentStatus.COMPLETED)) {
            throw new BusinessException(ErrorCode.ERR_APT_007_CANNOT_CANCEL);
        }

        appointment.setStatusCode(AppointmentStatus.CANCELLED);
        ServiceOrder order = appointment.getServiceOrder();
        order.setStatusCode(ServiceOrderStatus.CANCELLED);
        order.setCancelledAt(ClinicDateTime.now());
        order.setUpdatedBy(actorId);

        return assembler.toResponse(appointment, receptionService.getQueueNumberForAppointment(appointmentId));
    }

    @Transactional
    public AppointmentResponse quickCheckIn(QuickCheckInRequest request, UUID staffId) {
        QuickCheckInUseCase.Result result = quickCheckInUseCase.execute(request, staffId);
        return assembler.toResponse(result.appointment(), result.queueNumber());
    }

    @Transactional(readOnly = true)
    public CustomerLookupResponse lookupCustomerByPhone(String phone) {
        if (phone == null || phone.isBlank()) {
            throw new BusinessException(ErrorCode.ERR_APT_008_PHONE_REQUIRED);
        }
        Users owner = userRepository.findByNormalizedPhone(normalizePhone(phone))
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_ACC_002_USER_NOT_FOUND));

        List<CustomerLookupResponse.PetSummary> pets = petRepository
                .findByOwner_IdAndIsActive(owner.getId(), true, PageRequest.of(0, 100))
                .getContent()
                .stream()
                .map(p -> new CustomerLookupResponse.PetSummary(p.getId(), p.getName()))
                .toList();

        return new CustomerLookupResponse(owner.getId(), owner.getFullName(), owner.getPhone(), pets);
    }

    @Transactional(readOnly = true)
    public List<QueueEntryResponse> getVetQueue(UUID vetId, LocalDate date) {
        LocalDate targetDate = date != null ? date : ClinicDateTime.today();
        OffsetDateTime dayStart = ClinicDateTime.startOfDay(targetDate);
        OffsetDateTime dayEnd = ClinicDateTime.endOfDay(targetDate);

        return receptionService.getQueueForVet(vetId, dayStart, dayEnd).stream()
                .map(rt -> {
                    Appointment a = rt.getAppointment();
                    return new QueueEntryResponse(
                            rt.getQueueNumber(),
                            a.getId(),
                            a.getServiceOrder().getPet().getId(),
                            a.getServiceOrder().getPet().getName(),
                            a.getServiceOrder().getOwner().getFullName(),
                            rt.getCheckedInAt(),
                            a.getSymptomText()
                    );
                })
                .toList();
    }

    private Appointment findAppointmentOrThrow(UUID appointmentId) {
        return appointmentRepository.findDetailById(appointmentId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_APT_001_NOT_FOUND));
    }

    private void ensureMedicalAppointment(Appointment appointment) {
        if (appointment.getAppointmentType() != AppointmentType.MEDICAL) {
            throw new BusinessException(ErrorCode.ERR_VALIDATION_FAILED);
        }
    }

    private void ensureAssignedVet(Appointment appointment, UUID vetId) {
        Users assignedVet = appointment.getAssignedStaff();
        if (assignedVet == null) {
            throw new BusinessException(ErrorCode.ERR_APT_005_NO_VET_AVAILABLE);
        }
        if (vetId != null && !assignedVet.getId().equals(vetId)) {
            throw new BusinessException(ErrorCode.ERR_403_FORBIDDEN);
        }
    }

    private int resolveSlotMinutes() {
        return serviceCatalogRepository.findByServiceCodeAndIsActiveTrue(MEDICAL_SERVICE_CODE)
                .map(ServiceCatalog::getDurationMinutes)
                .filter(m -> m != null && m > 0)
                .orElse(DEFAULT_SLOT_MINUTES);
    }

    private String normalizePhone(String phone) {
        if (phone == null) {
            return "";
        }
        return phone.replaceAll("[\\s.\\-]", "");
    }

    private boolean matchesPhone(String ownerPhone, String needle) {
        return normalizePhone(ownerPhone).contains(needle);
    }

    private boolean containsIgnoreCase(String value, String needle) {
        return value != null && value.toLowerCase().contains(needle);
    }


    @Transactional
    public AppointmentResponse createGroomingAppointment(CreateGroomingAppointmentRequest request, UUID ownerId) {
        var createRequest = new com.astral.express.pccms.grooming.dto.request.GroomingBookingCreateRequest(
                request.petId(),
                serviceCatalogRepository.findByServiceCodeAndIsActiveTrue(request.serviceCode())
                        .map(ServiceCatalog::getId)
                        .orElseThrow(() -> new BusinessException(ErrorCode.ERR_APT_006_SERVICE_NOT_FOUND)),
                ClinicDateTime.toOffsetDateTime(request.appointmentDate(), request.slotStart()),
                request.ownerNote()
        );
        var ticketResponse = groomingService.createBooking(createRequest);
        GroomingTicket ticket = groomingTicketRepository.findById(ticketResponse.id())
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_APT_001_NOT_FOUND));
        return assembler.toResponse(ticket.getAppointment(), null);
    }

    @Transactional(readOnly = true)
    public List<GroomingBoardCardResponse> listGroomingBoard(LocalDate date) {
        LocalDate targetDate = date != null ? date : ClinicDateTime.today();
        OffsetDateTime dayStart = ClinicDateTime.startOfDay(targetDate);
        OffsetDateTime dayEnd = ClinicDateTime.endOfDay(targetDate);

        return groomingTicketRepository.findBoardForDate(dayStart, dayEnd, GroomingStatus.CANCELLED).stream()
                .map(assembler::toGroomingBoardCard)
                .toList();
    }

    @Transactional
    public GroomingBoardCardResponse updateGroomingStatus(UUID ticketId, UpdateGroomingStatusRequest request) {
        GroomingTicket ticket = groomingTicketRepository.findDetailById(ticketId)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_APT_001_NOT_FOUND));

        GroomingStatus newStatus = request.status();
        GroomingStatus current = ticket.getStatusCode();
        if (!isValidGroomingTransition(current, newStatus)) {
            throw new BusinessException(ErrorCode.ERR_VALIDATION_FAILED);
        }

        ticket.setStatusCode(newStatus);
        OffsetDateTime now = ClinicDateTime.now();
        if (newStatus == GroomingStatus.IN_SERVICE && ticket.getStartedAt() == null) {
            ticket.setStartedAt(now);
            ticket.getAppointment().setStatusCode(AppointmentStatus.IN_PROGRESS);
        }
        if (newStatus == GroomingStatus.COMPLETED) {
            ticket.setCompletedAt(now);
            ticket.getAppointment().setStatusCode(AppointmentStatus.COMPLETED);
            ServiceOrder order = ticket.getAppointment().getServiceOrder();
            order.setStatusCode(ServiceOrderStatus.COMPLETED);
            order.setCompletedAt(now);
        }
        if (newStatus == GroomingStatus.CANCELLED) {
            ticket.getAppointment().setStatusCode(AppointmentStatus.CANCELLED);
            ServiceOrder order = ticket.getAppointment().getServiceOrder();
            order.setStatusCode(ServiceOrderStatus.CANCELLED);
            order.setCancelledAt(now);
        }

        return assembler.toGroomingBoardCard(ticket);
    }

    @Transactional
    public BoardingBookingResponse createBoardingBooking(CreateBoardingBookingRequest request, UUID ownerId) {
        var createRequest = new com.astral.express.pccms.boarding.dto.request.BoardingBookingCreateRequest(
                request.petId(),
                request.roomTypeId(),
                ClinicDateTime.toOffsetDateTime(request.checkinDate(), LocalTime.of(14, 0)),
                ClinicDateTime.toOffsetDateTime(request.checkoutDate(), LocalTime.of(11, 0)),
                request.specialCareRequest()
        );
        var dedicatedResponse = boardingService.createBooking(createRequest);
        BoardingBooking booking = boardingBookingRepository.findById(dedicatedResponse.id())
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_APT_001_NOT_FOUND));
        return assembler.toBoardingResponse(booking);
    }

    @Transactional(readOnly = true)
    public List<BoardingBookingResponse> listOwnerBoardingBookings(UUID ownerId) {
        return boardingBookingRepository.findByOwnerId(ownerId).stream()
                .map(assembler::toBoardingResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<RoomTypeOptionResponse> listActiveRoomTypes() {
        return roomTypeRepository.findByIsActiveTrueOrderByNameAsc().stream()
                .map(assembler::toRoomTypeOptionResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ServiceCatalogOptionResponse> listServicesByCategory(ServiceCategory category) {
        return serviceCatalogRepository.findByCategoryCodeAndIsActiveTrueOrderByNameAsc(category).stream()
                .map(assembler::toServiceCatalogOptionResponse)
                .toList();
    }



    private boolean isValidGroomingTransition(GroomingStatus current, GroomingStatus next) {
        return switch (current) {
            case PENDING -> next == GroomingStatus.CONFIRMED || next == GroomingStatus.CANCELLED;
            case CONFIRMED -> next == GroomingStatus.IN_SERVICE || next == GroomingStatus.CANCELLED;
            case IN_SERVICE -> next == GroomingStatus.COMPLETED || next == GroomingStatus.CANCELLED;
            default -> false;
        };
    }
}
