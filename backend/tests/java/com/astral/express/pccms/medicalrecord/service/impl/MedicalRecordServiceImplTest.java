package com.astral.express.pccms.medicalrecord.service.impl;

import com.astral.express.pccms.appointment.service.AppointmentServiceFacade;
import com.astral.express.pccms.identity.security.SecurityHelper;
import com.astral.express.pccms.medicalrecord.dto.response.MedicalRecordResponse;
import com.astral.express.pccms.medicalrecord.entity.MedicalRecord;
import com.astral.express.pccms.medicalrecord.entity.RecordStatus;
import com.astral.express.pccms.medicalrecord.mapper.MedicalRecordMapper;
import com.astral.express.pccms.medicalrecord.repository.MedicalRecordRepository;
import com.astral.express.pccms.pet.entity.Pets;
import com.astral.express.pccms.pet.repository.PetRepository;
import com.astral.express.pccms.user.entity.Users;
import com.astral.express.pccms.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.context.ApplicationEventPublisher;

import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MedicalRecordServiceImplTest {

    @Mock
    private MedicalRecordRepository medicalRecordRepository;

    @Mock
    private MedicalRecordMapper medicalRecordMapper;

    @Mock
    private ApplicationEventPublisher eventPublisher;

    @Mock
    private AppointmentServiceFacade appointmentService;

    @Mock
    private SecurityHelper securityHelper;

    @Mock
    private PetRepository petRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private MedicalRecordServiceImpl medicalRecordService;

    private UUID vetId;
    private UUID petId1;
    private UUID petId2;

    @BeforeEach
    void setUp() {
        vetId = UUID.randomUUID();
        petId1 = UUID.randomUUID();
        petId2 = UUID.randomUUID();
    }

    @Test
    void should_BatchLoad_When_GettingMedicalRecords() {
        // GIVEN
        MedicalRecord record1 = new MedicalRecord();
        record1.setId(UUID.randomUUID());
        record1.setPetId(petId1);
        record1.setVetId(vetId);

        MedicalRecord record2 = new MedicalRecord();
        record2.setId(UUID.randomUUID());
        record2.setPetId(petId2);
        record2.setVetId(vetId);
        
        MedicalRecord record3 = new MedicalRecord();
        record3.setId(UUID.randomUUID());
        record3.setPetId(petId1); // duplicate petId to test deduplication
        record3.setVetId(vetId);

        MedicalRecord record4 = new MedicalRecord();
        record4.setId(UUID.randomUUID());
        record4.setPetId(null); // null petId to test null filtering
        record4.setVetId(null); // null vetId to test null filtering

        when(medicalRecordRepository.findByVetIdOrderByCreatedAtDesc(vetId))
                .thenReturn(List.of(record1, record2, record3, record4));

        Pets pet1 = new Pets();
        pet1.setId(petId1);
        pet1.setName("Rex");

        Pets pet2 = new Pets();
        pet2.setId(petId2);
        pet2.setName("Bella");

        Users vet = new Users();
        vet.setId(vetId);
        vet.setFullName("Dr. Smith");

        when(petRepository.findAllById(Set.of(petId1, petId2))).thenReturn(List.of(pet1, pet2));
        when(userRepository.findAllById(Set.of(vetId))).thenReturn(List.of(vet));

        MedicalRecordResponse mockResponse1 = new MedicalRecordResponse(record1.getId(), null, null, petId1, null, vetId, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
        MedicalRecordResponse mockResponse2 = new MedicalRecordResponse(record2.getId(), null, null, petId2, null, vetId, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
        MedicalRecordResponse mockResponse3 = new MedicalRecordResponse(record3.getId(), null, null, petId1, null, vetId, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);
        MedicalRecordResponse mockResponse4 = new MedicalRecordResponse(record4.getId(), null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null, null);

        when(medicalRecordMapper.toResponse(record1)).thenReturn(mockResponse1);
        when(medicalRecordMapper.toResponse(record2)).thenReturn(mockResponse2);
        when(medicalRecordMapper.toResponse(record3)).thenReturn(mockResponse3);
        when(medicalRecordMapper.toResponse(record4)).thenReturn(mockResponse4);

        // WHEN
        List<MedicalRecordResponse> results = medicalRecordService.getMedicalRecords(vetId);

        // THEN
        assertThat(results).hasSize(4);
        assertThat(results.get(0).petName()).isEqualTo("Rex");
        assertThat(results.get(0).vetName()).isEqualTo("Dr. Smith");
        assertThat(results.get(1).petName()).isEqualTo("Bella");
        assertThat(results.get(2).petName()).isEqualTo("Rex"); // Duplicate pet deduplicated
        assertThat(results.get(3).petName()).isEqualTo("Unknown Pet"); // Null petId fallback
        assertThat(results.get(3).vetName()).isEqualTo("Unknown Vet"); // Null vetId fallback

        verify(medicalRecordRepository, times(1)).findByVetIdOrderByCreatedAtDesc(vetId);
        verify(petRepository, times(1)).findAllById(Set.of(petId1, petId2));
        verify(userRepository, times(1)).findAllById(Set.of(vetId));
        
        verify(petRepository, never()).findById(any());
        verify(userRepository, never()).findById(any());
    }
}
