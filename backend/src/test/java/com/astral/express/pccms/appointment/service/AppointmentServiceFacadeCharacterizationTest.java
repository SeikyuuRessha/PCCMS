package com.astral.express.pccms.appointment.service;

import com.astral.express.pccms.appointment.dto.request.CreateBoardingBookingRequest;
import com.astral.express.pccms.appointment.dto.request.CreateGroomingAppointmentRequest;
import com.astral.express.pccms.appointment.dto.response.AppointmentResponse;
import com.astral.express.pccms.appointment.dto.response.BoardingBookingResponse;
import com.astral.express.pccms.appointment.entity.*;
import com.astral.express.pccms.appointment.repository.*;
import com.astral.express.pccms.boarding.entity.BoardingBooking;
import com.astral.express.pccms.boarding.entity.BoardingStatus;
import com.astral.express.pccms.boarding.repository.BoardingBookingRepository;
import com.astral.express.pccms.pet.entity.Pets;
import com.astral.express.pccms.pet.repository.PetRepository;
import com.astral.express.pccms.room.entity.RoomType;
import com.astral.express.pccms.room.repository.RoomTypeRepository;
import com.astral.express.pccms.user.entity.Users;
import com.astral.express.pccms.user.repository.UserRepository;
import com.astral.express.pccms.boarding.service.BoardingService;
import com.astral.express.pccms.grooming.service.GroomingService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Captor;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;
import com.astral.express.pccms.common.exception.BusinessException;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.never;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceFacadeCharacterizationTest {

    @Mock private AppointmentRepository appointmentRepository;
    @Mock private ServiceOrderRepository serviceOrderRepository;
    @Mock private ServiceCatalogRepository serviceCatalogRepository;
    @Mock private GroomingTicketRepository groomingTicketRepository;
    @Mock private RoomTypeRepository roomTypeRepository;
    @Mock private BoardingBookingRepository boardingBookingRepository;
    @Mock private PetRepository petRepository;
    @Mock private UserRepository userRepository;
    
    @Mock private AppointmentReceptionService receptionService;
    @Mock private AppointmentAvailabilityService availabilityService;
    @Mock private VetAvailabilityChecker vetAvailabilityChecker;
    @Mock private RoomAvailabilityChecker roomAvailabilityChecker;
    
    @Mock private CreateMedicalAppointmentUseCase createMedicalAppointmentUseCase;
    @Mock private GroomingService groomingService;
    @Mock private BoardingService boardingService;
    @Mock private QuickCheckInUseCase quickCheckInUseCase;

    // Real collaborators for the ones we want to characterize
    @Spy private AppointmentResponseAssembler assembler = new AppointmentResponseAssembler();
    
    private ServiceOrderFactory serviceOrderFactory;
    private PetValidationService petValidationService;
    
    
    
    private AppointmentServiceFacade facade;

    @Captor private ArgumentCaptor<ServiceOrder> serviceOrderCaptor;
    @Captor private ArgumentCaptor<BoardingBooking> boardingBookingCaptor;
    @Captor private ArgumentCaptor<Appointment> appointmentCaptor;
    @Captor private ArgumentCaptor<GroomingTicket> groomingTicketCaptor;

    private UUID ownerId = UUID.randomUUID();
    private UUID petId = UUID.randomUUID();
    private Users owner;
    private Pets pet;
    private ServiceCatalog serviceCatalog;
    private RoomType roomType;

    @BeforeEach
    void setUp() {
        serviceOrderFactory = new ServiceOrderFactory(serviceOrderRepository);
        petValidationService = new PetValidationService(petRepository);
        

        


        facade = new AppointmentServiceFacade(
            appointmentRepository, serviceCatalogRepository,
            groomingTicketRepository, roomTypeRepository, boardingBookingRepository,
            petRepository, userRepository, assembler, receptionService,
            availabilityService, vetAvailabilityChecker, roomAvailabilityChecker,
            createMedicalAppointmentUseCase, groomingService,
            boardingService, quickCheckInUseCase
        );

        owner = new Users();
        owner.setId(ownerId);
        owner.setFullName("Test Owner");
        owner.setPhone("0123456789");

        pet = new Pets();
        pet.setId(petId);
        pet.setName("Test Pet");
        pet.setOwner(owner);

        serviceCatalog = new ServiceCatalog();
        serviceCatalog.setServiceCode("BRD-STAY");
        serviceCatalog.setName("Boarding Stay");
        serviceCatalog.setCategoryCode(ServiceCategory.BOARDING);

        roomType = new RoomType();
        roomType.setId(UUID.randomUUID());
        roomType.setName("Standard Room");
        roomType.setIsActive(true);
        roomType.setBaseDailyPriceVnd(100000L);
    }

    @Test
    void should_CreateBoardingViaAppointmentFacade_IgnoreProvidedOwnerIdAndDelegateToDedicatedService() {
        // GIVEN
        LocalDate checkin = ClinicDateTime.today().plusDays(1);
        LocalDate checkout = ClinicDateTime.today().plusDays(3);
        CreateBoardingBookingRequest request = new CreateBoardingBookingRequest(petId, roomType.getId(), checkin, checkout, "Special diet");

        UUID dedicatedResponseId = UUID.randomUUID();
        var dedicatedResponse = org.mockito.Mockito.mock(com.astral.express.pccms.boarding.dto.response.BoardingBookingResponse.class);
        given(dedicatedResponse.id()).willReturn(dedicatedResponseId);
        given(boardingService.createBooking(any())).willReturn(dedicatedResponse);
        
        BoardingBooking savedBooking = new BoardingBooking();
        savedBooking.setId(dedicatedResponseId);
        savedBooking.setBookingCode("BR0001");
        savedBooking.setPet(pet);
        savedBooking.setRequestedRoomType(roomType);
        savedBooking.setExpectedCheckinAt(ClinicDateTime.toOffsetDateTime(checkin, LocalTime.of(14, 0)));
        savedBooking.setExpectedCheckoutAt(ClinicDateTime.toOffsetDateTime(checkout, LocalTime.of(11, 0)));
        savedBooking.setEstimatedPriceVnd(200000L);
        savedBooking.setStatusCode(BoardingStatus.RESERVED);
        savedBooking.setSpecialCareRequest("Special diet");
        
        given(boardingBookingRepository.findById(dedicatedResponseId)).willReturn(Optional.of(savedBooking));

        // WHEN - Note: ownerId is intentionally ignored here, dedicated service uses authenticated user
        UUID ignoredOwnerId = UUID.randomUUID();
        BoardingBookingResponse response = facade.createBoardingBooking(request, ignoredOwnerId);

        // THEN
        assertThat(response).isNotNull();
        assertThat(response.bookingCode()).isEqualTo("BR0001");
        assertThat(response.petName()).isEqualTo("Test Pet");
        assertThat(response.roomTypeName()).isEqualTo("Standard Room");
        assertThat(response.statusCode()).isEqualTo(BoardingStatus.RESERVED);
        assertThat(response.statusLabel()).isEqualTo("Đã đặt phòng");
        assertThat(response.specialCareRequest()).isEqualTo("Special diet");
        
        // Documenting that it delegated to the dedicated service
        verify(boardingService).createBooking(any(com.astral.express.pccms.boarding.dto.request.BoardingBookingCreateRequest.class));
    }



    @Test
    void should_CreateGroomingViaAppointmentFacade_IgnoreProvidedOwnerIdAndDelegateToDedicatedService() {
        // GIVEN
        LocalDate appointmentDate = ClinicDateTime.today().plusDays(1);
        LocalTime slotStart = LocalTime.of(10, 0);
        CreateGroomingAppointmentRequest request = new CreateGroomingAppointmentRequest(petId, "GRM-001", appointmentDate, slotStart, "Needs gentle care");

        ServiceCatalog groomingServiceCatalog = new ServiceCatalog();
        groomingServiceCatalog.setId(UUID.randomUUID());
        groomingServiceCatalog.setServiceCode("GRM-001");
        groomingServiceCatalog.setName("Basic Grooming");
        groomingServiceCatalog.setCategoryCode(ServiceCategory.GROOMING);
        groomingServiceCatalog.setDurationMinutes(60);

        given(serviceCatalogRepository.findByServiceCodeAndIsActiveTrue("GRM-001")).willReturn(Optional.of(groomingServiceCatalog));
        
        UUID dedicatedTicketId = UUID.randomUUID();
        var dedicatedResponse = org.mockito.Mockito.mock(com.astral.express.pccms.grooming.dto.response.GroomingTicketResponse.class);
        given(dedicatedResponse.id()).willReturn(dedicatedTicketId);
        given(groomingService.createBooking(any())).willReturn(dedicatedResponse);

        Appointment savedAppointment = new Appointment();
        savedAppointment.setId(UUID.randomUUID());
        savedAppointment.setAppointmentType(AppointmentType.GROOMING);
        savedAppointment.setStatusCode(AppointmentStatus.PENDING);
        
        ServiceOrder so = new ServiceOrder();
        so.setOrderCode("SO-12345");
        so.setService(groomingServiceCatalog);
        so.setOwner(owner);
        so.setPet(pet);
        savedAppointment.setServiceOrder(so);
        
        GroomingTicket ticket = new GroomingTicket();
        ticket.setId(dedicatedTicketId);
        ticket.setAppointment(savedAppointment);
        
        given(groomingTicketRepository.findById(dedicatedTicketId)).willReturn(Optional.of(ticket));

        // WHEN - Note: ownerId is intentionally ignored here, dedicated service uses authenticated user
        UUID ignoredOwnerId = UUID.randomUUID();
        AppointmentResponse response = facade.createGroomingAppointment(request, ignoredOwnerId);

        // THEN
        assertThat(response).isNotNull();
        assertThat(response.serviceName()).isEqualTo("Basic Grooming");
        assertThat(response.petName()).isEqualTo("Test Pet");
        assertThat(response.statusCode()).isEqualTo(AppointmentStatus.PENDING);
        assertThat(response.statusLabel()).isEqualTo("Chờ tiếp nhận");
        
        // Documenting that it delegated to the dedicated service
        verify(groomingService).createBooking(any(com.astral.express.pccms.grooming.dto.request.GroomingBookingCreateRequest.class));
    }


}
