package com.astral.express.pccms.schedule.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Entity
@Table(name = "exam_rooms")
@Getter
@Setter
@NoArgsConstructor
public class ExamRoom {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "room_code", nullable = false, unique = true, length = 20)
    private String roomCode;

    @Column(nullable = false, length = 80)
    private String name;

    @Column(nullable = false)
    private Integer floor = 1;

    @Column(name = "is_active", nullable = false)
    private Boolean isActive = true;
}
