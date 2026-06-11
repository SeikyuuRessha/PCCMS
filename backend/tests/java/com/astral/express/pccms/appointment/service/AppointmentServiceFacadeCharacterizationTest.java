package com.astral.express.pccms.appointment.service;

import com.astral.express.pccms.appointment.dto.request.CreateMedicalAppointmentRequest;
import com.astral.express.pccms.appointment.dto.request.QuickCheckInRequest;
import com.astral.express.pccms.appointment.dto.response.AppointmentResponse;
import com.astral.express.pccms.appointment.entity.Appointment;
import com.astral.express.pccms.appointment.entity.AppointmentStatus;
import com.astral.express.pccms.appointment.entity.AppointmentType;
import com.astral.express.pccms.appointment.entity.ExamRoom;
import com.astral.express.pccms.appointment.entity.ReceptionTicket;
import com.astral.express.pccms.appointment.entity.ServiceCatalog;
import com.astral.express.pccms.appointment.entity.ServiceOrder;
import com.astral.express.pccms.appointment.entity.ServiceOrderStatus;
import com.astral.express.pccms.appointment.repository.AppointmentRepository;
import com.astral.express.pccms.appointment.repository.ExamRoomRepository;
import com.astral.express.pccms.appointment.repository.GroomingTicketRepository;
import com.astral.express.pccms.appointment.repository.ReceptionTicketRepository;
import com.astral.express.pccms.appointment.repository.ServiceCatalogRepository;
import com.astral.express.pccms.appointment.repository.ServiceOrderRepository;
import com.astral.express.pccms.boarding.repository.BoardingBookingRepository;
import com.astral.express.pccms.common.exception.BusinessException;
import com.astral.express.pccms.common.exception.ErrorCode;
import com.astral.express.pccms.grooming.repository.GroomingStationRepository;
import com.astral.express.pccms.pet.entity.Pets;
import com.astral.express.pccms.pet.repository.PetRepository;
import com.astral.express.pccms.room.repository.RoomTypeRepository;
import com.astral.express.pccms.schedule.repository.WorkScheduleRepository;
import com.astral.express.pccms.user.entity.Roles;
import com.astral.express.pccms.user.entity.Users;
import com.astral.express.pccms.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.Spy;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.BDDMockito.given;
import static org.mockito.Mockito.lenient;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class AppointmentServiceFacadeCharacterizationTest {

    @Mock private AppointmentRepository appointmentRepository;
    @Mock private ServiceOrderRepository serviceOrderRepository;
    @Mock private ServiceCatalogRepository serviceCatalogRepository;
    @Mock private ReceptionTicketRepository receptionTicketRepository;
    @Mock private ExamRoomRepository examRoomRepository;
    @Mock private WorkScheduleRepository workScheduleRepository;
    @Mock private GroomingStationRepository groomingStationRepository;
    @Mock private GroomingTicketRepository groomingTicketRepository;
    @Mock private RoomTypeRepository roomTypeRepository;
    @Mock private BoardingBookingRepository boardingBookingRepository;
    @Mock private PetRepository petRepository;
    @Mock private UserRepository userRepository;
    
    @Spy private AppointmentResponseAssembler assembler = new AppointmentResponseAssembler();

    private AppointmentServiceFacade appointmentService;

    private Users owner;
    private Pets pet;
    private Users vet;
    private ExamRoom room;
    private ServiceCatalog medicalService;
    private final UUID ownerId = UUID.randomUUID();
    private final UUID petId = UUID.randomUUID();
    private final UUID vetId = UUID.randomUUID();

    @BeforeEach
    void setUp() {
        AppointmentOverlapChecker overlapChecker = new AppointmentOverlapChecker(appointmentRepository);
        RoomAvailabilityChecker roomAvailabilityChecker = new RoomAvailabilityChecker(examRoomRepository, groomingStationRepository, overlapChecker);
        VetAvailabilityChecker vetAvailabilityChecker = new VetAvailabilityChecker(userRepository, workScheduleRepository, overlapChecker);
        AppointmentAvailabilityService availabilityService = new AppointmentAvailabilityService(vetAvailabilityChecker, roomAvailabilityChecker, overlapChecker);
        AppointmentReceptionService receptionService = new AppointmentReceptionService(receptionTicketRepository);
        ServiceOrderFactory serviceOrderFactory = new ServiceOrderFactory(serviceOrderRepository);
        PetValidationService petValidationService = new PetValidationService(petRepository);
        CreateMedicalAppointmentUseCase createMedicalAppointmentUseCase = new CreateMedicalAppointmentUseCase(
                petRepository, serviceCatalogRepository, serviceOrderRepository, appointmentRepository,
                availabilityService, vetAvailabilityChecker, roomAvailabilityChecker, serviceOrderFactory, petValidationService
        );
        CreateGroomingAppointmentUseCase createGroomingAppointmentUseCase = new CreateGroomingAppointmentUseCase(
                petRepository, serviceCatalogRepository, serviceOrderRepository, appointmentRepository,
                groomingTicketRepository, roomAvailabilityChecker, serviceOrderFactory, petValidationService
        );
        CreateBoardingBookingUseCase createBoardingBookingUseCase = new CreateBoardingBookingUseCase(
                petRepository, roomTypeRepository, serviceCatalogRepository, serviceOrderRepository, boardingBookingRepository, serviceOrderFactory, petValidationService
        );
        QuickCheckInUseCase quickCheckInUseCase = new QuickCheckInUseCase(
                userRepository, petValidationService, availabilityService, vetAvailabilityChecker, roomAvailabilityChecker,
                serviceCatalogRepository, serviceOrderFactory, serviceOrderRepository, appointmentRepository, receptionService
        );
        appointmentService = new AppointmentServiceFacade(
                appointmentRepository, serviceOrderRepository, serviceCatalogRepository,
                groomingTicketRepository, roomTypeRepository,
                boardingBookingRepository, petRepository, userRepository, assembler,
                receptionService, availabilityService, vetAvailabilityChecker, roomAvailabilityChecker,
                createMedicalAppointmentUseCase, createGroomingAppointmentUseCase, createBoardingBookingUseCase, quickCheckInUseCase
        );

        owner = new Users();
        owner.setId(ownerId);
        owner.setFullName("Nguyen Van A");

        pet = new Pets();
        pet.setId(petId);
        pet.setName("Milu");
        pet.setOwner(owner);
        pet.setIsActive(true);

        Roles vetRole = new Roles();
        vetRole.setCode("VETERINARIAN");
        
        vet = new Users();
        vet.setId(vetId);
        vet.setFullName("Le Van B");
        vet.setRole(vetRole);

        room = new ExamRoom();
        room.setId(UUID.randomUUID());
        room.setRoomCode("R1");

        medicalService = new ServiceCatalog();
        medicalService.setName("Khám chung");
        medicalService.setDurationMinutes(30);
        medicalService.setBasePriceVnd(100000L);
    }

    @Test
    void should_CreateMedicalAppointment_And_AssignRoomAndVet_Successfully() {
        // GIVEN
        LocalDate futureDate = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).plusDays(1);
        LocalTime slotStart = LocalTime.of(8, 0);
        CreateMedicalAppointmentRequest request = new CreateMedicalAppointmentRequest(
                petId, futureDate, slotStart, null, "Sốt", "Không có"
        );

        given(petRepository.findById(petId)).willReturn(Optional.of(pet));
        given(examRoomRepository.findByIsActiveTrueOrderByRoomCodeAsc()).willReturn(List.of(room));
        given(appointmentRepository.countOverlappingInRoom(any(), any(), any())).willReturn(0L);
        lenient().when(workScheduleRepository.findAvailableVetIds(any(), any())).thenReturn(List.of(vetId));
        lenient().when(userRepository.findActiveByRoleCode("VETERINARIAN")).thenReturn(List.of(vet));
        given(userRepository.findById(vetId)).willReturn(Optional.of(vet));
        given(appointmentRepository.countOverlappingForStaff(any(), any(), any())).willReturn(0L);
        given(serviceCatalogRepository.findByServiceCodeAndIsActiveTrue("MED-GENERAL")).willReturn(Optional.of(medicalService));

        Appointment mockedSaved = new Appointment();
        mockedSaved.setId(UUID.randomUUID());
        ServiceOrder order = new ServiceOrder();
        order.setOrderCode("AP0001");
        order.setOwner(owner);
        order.setPet(pet);
        order.setService(medicalService);
        mockedSaved.setServiceOrder(order);
        mockedSaved.setAssignedStaff(vet);
        mockedSaved.setAppointmentType(AppointmentType.MEDICAL);
        mockedSaved.setStatusCode(AppointmentStatus.PENDING);

        given(appointmentRepository.save(any(Appointment.class))).willReturn(mockedSaved);

        // WHEN
        AppointmentResponse response = appointmentService.createMedicalAppointment(request, ownerId);

        // THEN
        ArgumentCaptor<Appointment> captor = ArgumentCaptor.forClass(Appointment.class);
        verify(appointmentRepository).save(captor.capture());
        Appointment saved = captor.getValue();

        assertThat(saved.getAssignedStaff().getId()).isEqualTo(vetId);
        assertThat(saved.getExamRoom().getId()).isEqualTo(room.getId());
        assertThat(saved.getStatusCode()).isEqualTo(AppointmentStatus.PENDING);
        assertThat(response.assignedVetName()).isEqualTo("BS. Le Van B"); // verify formatting is preserved for now
    }

    @Test
    void should_CheckIn_And_CreateReceptionTicket_With_CorrectQueueNumber() {
        // GIVEN
        UUID appointmentId = UUID.randomUUID();
        UUID staffId = UUID.randomUUID();
        
        Users staff = new Users();
        staff.setId(staffId);

        ServiceOrder order = new ServiceOrder();
        order.setOrderCode("AP0001");
        order.setOwner(owner);
        order.setPet(pet);
        order.setService(medicalService);

        Appointment appointment = new Appointment();
        appointment.setId(appointmentId);
        appointment.setStatusCode(AppointmentStatus.PENDING);
        appointment.setAssignedStaff(vet);
        appointment.setServiceOrder(order);

        given(appointmentRepository.findDetailById(appointmentId)).willReturn(Optional.of(appointment));
        given(userRepository.findById(staffId)).willReturn(Optional.of(staff));
        given(receptionTicketRepository.findMaxQueueNumberForVet(eq(vetId), any(), any())).willReturn(5);

        // WHEN
        AppointmentResponse response = appointmentService.checkIn(appointmentId, staffId);

        // THEN
        assertThat(appointment.getStatusCode()).isEqualTo(AppointmentStatus.CHECKED_IN);
        
        ArgumentCaptor<ReceptionTicket> ticketCaptor = ArgumentCaptor.forClass(ReceptionTicket.class);
        verify(receptionTicketRepository).save(ticketCaptor.capture());
        
        ReceptionTicket ticket = ticketCaptor.getValue();
        assertThat(ticket.getQueueNumber()).isEqualTo(6); // Max 5 + 1
        assertThat(response.queueNumber()).isEqualTo(6);
    }

    @Test
    void should_RejectAppointment_When_RoomOrVetOverlaps() {
        // GIVEN
        LocalDate futureDate = LocalDate.now(ZoneId.of("Asia/Ho_Chi_Minh")).plusDays(1);
        LocalTime slotStart = LocalTime.of(8, 0);
        CreateMedicalAppointmentRequest request = new CreateMedicalAppointmentRequest(
                petId, futureDate, slotStart, vetId, "Sốt", "Không có"
        );

        given(petRepository.findById(petId)).willReturn(Optional.of(pet));
        lenient().when(examRoomRepository.findByIsActiveTrueOrderByRoomCodeAsc()).thenReturn(List.of(room));
        // Simulate no rooms available
        given(appointmentRepository.countOverlappingInRoom(any(), any(), any())).willReturn(1L);

        // WHEN & THEN
        assertThatThrownBy(() -> appointmentService.createMedicalAppointment(request, ownerId))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.ERR_APT_009_SLOT_FULL);
    }

    @Test
    void should_ReturnFormattedVetName_And_TimeSlot() {
        // This is implicitly tested in should_CreateMedicalAppointment_And_AssignRoomAndVet_Successfully
        // But we add a dedicated assertion check here if needed via getAppointmentById
        
        UUID appointmentId = UUID.randomUUID();
        ServiceOrder order = new ServiceOrder();
        order.setOrderCode("AP0001");
        order.setOwner(owner);
        order.setPet(pet);
        order.setService(medicalService);

        Appointment appointment = new Appointment();
        appointment.setId(appointmentId);
        appointment.setStatusCode(AppointmentStatus.PENDING);
        appointment.setAssignedStaff(vet);
        appointment.setServiceOrder(order);
        
        given(appointmentRepository.findDetailById(appointmentId)).willReturn(Optional.of(appointment));
        given(receptionTicketRepository.findByAppointmentId(appointmentId)).willReturn(Optional.empty());

        AppointmentResponse response = appointmentService.getAppointmentById(appointmentId);
        
        assertThat(response.assignedVetName()).isEqualTo("BS. Le Van B");
    }

    @Test
    void should_QuickCheckIn_ThrowException_When_CustomerNotFound() {
        QuickCheckInRequest request = new QuickCheckInRequest("0901234567", petId, vetId, "S`t");
        given(userRepository.findByNormalizedPhone(any())).willReturn(Optional.empty());

        assertThatThrownBy(() -> appointmentService.quickCheckIn(request, ownerId))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.ERR_ACC_002_USER_NOT_FOUND);
    }

    @Test
    void should_QuickCheckIn_ThrowException_When_PetNotFound() {
        QuickCheckInRequest request = new QuickCheckInRequest("0901234567", petId, vetId, "S`t");
        given(userRepository.findByNormalizedPhone(any())).willReturn(Optional.of(owner));
        given(petRepository.findById(petId)).willReturn(Optional.empty());

        assertThatThrownBy(() -> appointmentService.quickCheckIn(request, ownerId))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.ERR_PET_001_NOT_FOUND);
    }

    @Test
    void should_QuickCheckIn_CreateAppointmentAndReceptionTicket_When_Valid() {
        QuickCheckInRequest request = new QuickCheckInRequest("0901234567", petId, vetId, "S`t");
        given(userRepository.findByNormalizedPhone(any())).willReturn(Optional.of(owner));
        given(petRepository.findById(petId)).willReturn(Optional.of(pet));
        given(userRepository.findById(ownerId)).willReturn(Optional.of(owner)); // staff

        given(appointmentRepository.countOverlappingForStaff(any(), any(), any())).willReturn(0L);
        given(appointmentRepository.countOverlappingInRoom(any(), any(), any())).willReturn(0L);
        lenient().when(workScheduleRepository.findAvailableVetIds(any(), any())).thenReturn(List.of(vetId));
        lenient().when(userRepository.findActiveByRoleCode("VETERINARIAN")).thenReturn(List.of(vet));
        given(userRepository.findById(vetId)).willReturn(Optional.of(vet));
        given(examRoomRepository.findByIsActiveTrueOrderByRoomCodeAsc()).willReturn(List.of(room));
        given(serviceCatalogRepository.findByServiceCodeAndIsActiveTrue("MED-GENERAL")).willReturn(Optional.of(medicalService));
        given(receptionTicketRepository.findMaxQueueNumberForVet(eq(vetId), any(), any())).willReturn(5);

        Appointment mockedSaved = new Appointment();
        mockedSaved.setId(UUID.randomUUID());
        ServiceOrder order = new ServiceOrder();
        order.setOrderCode("AP0001");
        order.setOwner(owner);
        order.setPet(pet);
        order.setService(medicalService);
        mockedSaved.setServiceOrder(order);
        mockedSaved.setAssignedStaff(vet);
        mockedSaved.setExamRoom(room);
        mockedSaved.setAppointmentType(AppointmentType.MEDICAL);
        mockedSaved.setStatusCode(AppointmentStatus.CHECKED_IN);

        given(appointmentRepository.save(any(Appointment.class))).willReturn(mockedSaved);

        AppointmentResponse response = appointmentService.quickCheckIn(request, ownerId); // staffId = ownerId for test

        ArgumentCaptor<Appointment> captor = ArgumentCaptor.forClass(Appointment.class);
        verify(appointmentRepository).save(captor.capture());
        Appointment saved = captor.getValue();

        assertThat(saved.getAssignedStaff().getId()).isEqualTo(vetId);
        assertThat(saved.getExamRoom().getId()).isEqualTo(room.getId());
        assertThat(saved.getStatusCode()).isEqualTo(AppointmentStatus.CHECKED_IN);
        
        ArgumentCaptor<ReceptionTicket> ticketCaptor = ArgumentCaptor.forClass(ReceptionTicket.class);
        verify(receptionTicketRepository).save(ticketCaptor.capture());
        ReceptionTicket ticket = ticketCaptor.getValue();
        assertThat(ticket.getQueueNumber()).isEqualTo(6);

        assertThat(response.queueNumber()).isEqualTo(6);
    }

    @Test
    void should_QuickCheckIn_Reject_When_NoVetOrRoomAvailable() {
        QuickCheckInRequest request = new QuickCheckInRequest("0901234567", petId, vetId, "S`t");
        given(userRepository.findByNormalizedPhone(any())).willReturn(Optional.of(owner));
        given(petRepository.findById(petId)).willReturn(Optional.of(pet));
        
        // Simulating no rooms available
        lenient().when(examRoomRepository.findByIsActiveTrueOrderByRoomCodeAsc()).thenReturn(List.of(room));
        given(appointmentRepository.countOverlappingInRoom(any(), any(), any())).willReturn(1L);

        assertThatThrownBy(() -> appointmentService.quickCheckIn(request, ownerId))
                .isInstanceOf(BusinessException.class)
                .hasFieldOrPropertyWithValue("errorCode", ErrorCode.ERR_APT_009_SLOT_FULL);
    }
}
