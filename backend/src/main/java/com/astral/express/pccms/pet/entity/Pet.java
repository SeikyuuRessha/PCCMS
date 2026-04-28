package com.astral.express.pccms.pet.entity;

import com.astral.express.pccms.common.entity.BaseModel;
import com.astral.express.pccms.user.entity.Users;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.time.LocalDate;

@Entity
@Table(name = "Pets")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor

public class Pet extends BaseModel {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private String petId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private String owner;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(nullable = false, length = 50)
    private String species;

    @Column(nullable = false, length = 50)
    private String gender;

    @Column(nullable = false)
    private Double weight;

    @Column(length = 50)
    private String breed;

    private LocalDate dob;

    @Column(length = 50)
    private String color;

    @Column(length = 500)
    private String specialNotes;
}
