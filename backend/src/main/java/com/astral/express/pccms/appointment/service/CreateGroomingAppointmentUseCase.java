package com.astral.express.pccms.appointment.service;

import com.astral.express.pccms.appointment.dto.request.CreateGroomingAppointmentRequest;
import com.astral.express.pccms.appointment.entity.Appointment;
import com.astral.express.pccms.appointment.entity.AppointmentStatus;
import com.astral.express.pccms.appointment.entity.AppointmentType;
import com.astral.express.pccms.appointment.entity.GroomingStatus;
import com.astral.express.pccms.appointment.entity.GroomingTicket;
import com.astral.express.pccms.appointment.entity.ServiceCatalog;
import com.astral.express.pccms.appointment.entity.ServiceCategory;
import com.astral.express.pccms.appointment.entity.ServiceOrder;
import com.astral.express.pccms.appointment.entity.ServiceOrderStatus;
import com.astral.express.pccms.appointment.repository.AppointmentRepository;
import com.astral.express.pccms.appointment.repository.GroomingTicketRepository;
import com.astral.express.pccms.appointment.repository.ServiceCatalogRepository;
import com.astral.express.pccms.appointment.repository.ServiceOrderRepository;
import com.astral.express.pccms.common.exception.BusinessException;
import com.astral.express.pccms.common.exception.ErrorCode;
import com.astral.express.pccms.pet.entity.Pets;
import com.astral.express.pccms.pet.repository.PetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CreateGroomingAppointmentUseCase {



    private final PetRepository petRepository;
    private final ServiceCatalogRepository serviceCatalogRepository;
    private final ServiceOrderRepository serviceOrderRepository;
    private final AppointmentRepository appointmentRepository;
    private final GroomingTicketRepository groomingTicketRepository;
    private final RoomAvailabilityChecker roomAvailabilityChecker;
    private final ServiceOrderFactory serviceOrderFactory;
    private final PetValidationService petValidationService;

    public Appointment createGroomingAppointment(CreateGroomingAppointmentRequest request, UUID ownerId) {
        Pets pet = petValidationService.findPetOwnedBy(request.petId(), ownerId);
        validateFutureDate(request.appointmentDate());

        ServiceCatalog service = serviceCatalogRepository.findByServiceCodeAndIsActiveTrue(request.serviceCode())
                .filter(s -> s.getCategoryCode() == ServiceCategory.GROOMING)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_APT_006_SERVICE_NOT_FOUND));

        int durationMinutes = service.getDurationMinutes() != null && service.getDurationMinutes() > 0
                ? service.getDurationMinutes() : 60;

        OffsetDateTime startAt = ClinicDateTime.toOffsetDateTime(request.appointmentDate(), request.slotStart());
        OffsetDateTime endAt = startAt.plusMinutes(durationMinutes);

        validateSlotNotPast(startAt);
        roomAvailabilityChecker.requireGroomingSlotAvailable(startAt, endAt);

        ServiceOrder order = serviceOrderFactory.createServiceOrder(pet, service, ownerId, startAt, endAt, ServiceCategory.GROOMING);
        serviceOrderRepository.save(order);

        Appointment appointment = new Appointment();
        appointment.setServiceOrder(order);
        appointment.setAppointmentType(AppointmentType.GROOMING);
        appointment.setScheduledStartAt(startAt);
        appointment.setScheduledEndAt(endAt);
        appointment.setStatusCode(AppointmentStatus.PENDING);
        appointment.setOwnerNote(request.ownerNote());
        appointment.setCreatedBy(ownerId);

        Appointment saved = appointmentRepository.save(appointment);

        GroomingTicket ticket = new GroomingTicket();
        ticket.setAppointment(saved);
        ticket.setStatusCode(GroomingStatus.PENDING);
        ticket.setOwnerNote(request.ownerNote());
        groomingTicketRepository.save(ticket);

        return saved;
    }

    private void validateFutureDate(LocalDate date) {
        if (date.isBefore(ClinicDateTime.today())) {
            throw new BusinessException(ErrorCode.ERR_APT_002_PAST_DATETIME);
        }
    }

    private void validateSlotNotPast(OffsetDateTime startAt) {
        if (startAt.isBefore(ClinicDateTime.now())) {
            throw new BusinessException(ErrorCode.ERR_APT_002_PAST_DATETIME);
        }
    }
}
