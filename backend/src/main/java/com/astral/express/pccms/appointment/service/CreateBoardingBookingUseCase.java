package com.astral.express.pccms.appointment.service;

import com.astral.express.pccms.appointment.dto.request.CreateBoardingBookingRequest;
import com.astral.express.pccms.appointment.entity.ServiceCatalog;
import com.astral.express.pccms.appointment.entity.ServiceCategory;
import com.astral.express.pccms.appointment.entity.ServiceOrder;
import com.astral.express.pccms.appointment.entity.ServiceOrderStatus;
import com.astral.express.pccms.appointment.repository.ServiceCatalogRepository;
import com.astral.express.pccms.appointment.repository.ServiceOrderRepository;
import com.astral.express.pccms.boarding.entity.BoardingBooking;
import com.astral.express.pccms.boarding.entity.BoardingStatus;
import com.astral.express.pccms.boarding.repository.BoardingBookingRepository;
import com.astral.express.pccms.common.exception.BusinessException;
import com.astral.express.pccms.common.exception.ErrorCode;
import com.astral.express.pccms.pet.entity.Pets;
import com.astral.express.pccms.pet.repository.PetRepository;
import com.astral.express.pccms.room.entity.RoomType;
import com.astral.express.pccms.room.repository.RoomTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.time.temporal.ChronoUnit;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class CreateBoardingBookingUseCase {



    private final PetRepository petRepository;
    private final RoomTypeRepository roomTypeRepository;
    private final ServiceCatalogRepository serviceCatalogRepository;
    private final ServiceOrderRepository serviceOrderRepository;
    private final BoardingBookingRepository boardingBookingRepository;
    private final ServiceOrderFactory serviceOrderFactory;
    private final PetValidationService petValidationService;

    public BoardingBooking createBoardingBooking(CreateBoardingBookingRequest request, UUID ownerId) {
        if (request.checkoutDate().isBefore(request.checkinDate())
                || request.checkoutDate().isEqual(request.checkinDate())) {
            throw new BusinessException(ErrorCode.ERR_VALIDATION_FAILED);
        }
        if (request.checkinDate().isBefore(ClinicDateTime.today())) {
            throw new BusinessException(ErrorCode.ERR_APT_002_PAST_DATETIME);
        }

        Pets pet = petValidationService.findPetOwnedBy(request.petId(), ownerId);
        RoomType roomType = roomTypeRepository.findById(request.roomTypeId())
                .filter(RoomType::getIsActive)
                .orElseThrow(() -> new BusinessException(ErrorCode.ERR_VALIDATION_FAILED));

        ServiceCatalog service = serviceCatalogRepository.findByServiceCodeAndIsActiveTrue("BRD-STAY")
                .orElseGet(() -> serviceCatalogRepository.findFirstByCategoryCodeAndIsActiveTrue(ServiceCategory.BOARDING)
                        .orElseThrow(() -> new BusinessException(ErrorCode.ERR_APT_006_SERVICE_NOT_FOUND)));

        OffsetDateTime checkinAt = ClinicDateTime.toOffsetDateTime(request.checkinDate(), LocalTime.of(14, 0));
        OffsetDateTime checkoutAt = ClinicDateTime.toOffsetDateTime(request.checkoutDate(), LocalTime.of(11, 0));
        long days = ChronoUnit.DAYS.between(request.checkinDate(), request.checkoutDate());
        Long estimated = (roomType.getBaseDailyPriceVnd() != null ? roomType.getBaseDailyPriceVnd() : 0L) * Math.max(days, 1);

        ServiceOrder order = serviceOrderFactory.createServiceOrder(pet, service, ownerId, checkinAt, checkoutAt, ServiceCategory.BOARDING);
        order.setBaseAmountVnd(estimated);
        serviceOrderRepository.save(order);

        BoardingBooking booking = new BoardingBooking();
        booking.setBookingCode(generateBoardingCode());
        booking.setServiceOrder(order);
        booking.setOwner(pet.getOwner());
        booking.setPet(pet);
        booking.setRequestedRoomType(roomType);
        booking.setExpectedCheckinAt(checkinAt);
        booking.setExpectedCheckoutAt(checkoutAt);
        booking.setSpecialCareRequest(request.specialCareRequest());
        booking.setEstimatedPriceVnd(estimated);
        booking.setStatusCode(BoardingStatus.RESERVED);
        booking.setCreatedBy(pet.getOwner());

        return boardingBookingRepository.save(booking);
    }

    private String generateBoardingCode() {
        long seq = boardingBookingRepository.maxBookingSequence() + 1;
        return String.format("BR%04d", seq);
    }
}
