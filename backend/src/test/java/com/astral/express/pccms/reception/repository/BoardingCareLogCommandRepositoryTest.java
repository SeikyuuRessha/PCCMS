package com.astral.express.pccms.reception.repository;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.jdbc.core.JdbcTemplate;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.UUID;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.verify;

@ExtendWith(MockitoExtension.class)
class BoardingCareLogCommandRepositoryTest {

    @Mock
    private JdbcTemplate jdbc;

    @Test
    void activeScheduleUsesExplicitClinicTimeInsteadOfDatabaseSessionTimezone() {
        BoardingCareLogCommandRepository repository = new BoardingCareLogCommandRepository(jdbc);
        UUID staffId = UUID.randomUUID();
        LocalDate clinicDate = LocalDate.of(2026, 6, 19);
        LocalTime clinicTime = LocalTime.of(13, 30);

        repository.findActiveWorkScheduleId(staffId, clinicDate, clinicTime);

        ArgumentCaptor<String> sql = ArgumentCaptor.forClass(String.class);
        verify(jdbc).queryForObject(sql.capture(), eq(UUID.class), any(Object[].class));
        assertThat(sql.getValue()).doesNotContain("CURRENT_TIME", "CURRENT_TIMESTAMP");
    }

    @Test
    void editPolicyUsesExplicitClinicDateAndTimeInsteadOfDatabaseSessionTimezone() {
        BoardingCareLogCommandRepository repository = new BoardingCareLogCommandRepository(jdbc);

        repository.canEditCareLog(
                UUID.randomUUID(),
                UUID.randomUUID(),
                LocalDate.of(2026, 6, 19),
                LocalTime.of(13, 30));

        ArgumentCaptor<String> sql = ArgumentCaptor.forClass(String.class);
        verify(jdbc).queryForObject(sql.capture(), eq(Boolean.class), any(Object[].class));
        assertThat(sql.getValue()).doesNotContain("CURRENT_TIME", "CURRENT_TIMESTAMP");
    }
}
