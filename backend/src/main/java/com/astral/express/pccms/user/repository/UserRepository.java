package com.astral.express.pccms.user.repository;

import com.astral.express.pccms.user.entity.Users;
import com.astral.express.pccms.user.entity.UserStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<Users, UUID>, JpaSpecificationExecutor<Users> {
    Optional<Users> findByEmail(String email);

    @Query("SELECT u FROM Users u " +
           "LEFT JOIN FETCH u.role r " +
           "LEFT JOIN FETCH r.permissions " +
           "WHERE u.email = :email")
    Optional<Users> findByEmailWithRoleAndPermissions(@Param("email") String email);

    @Query("SELECT u FROM Users u " +
           "LEFT JOIN FETCH u.role r " +
           "LEFT JOIN FETCH r.permissions " +
           "WHERE u.id = :id")
    Optional<Users> findByIdWithRoleAndPermissions(@Param("id") UUID id);

    boolean existsByEmail(String email);

    @Query(value = """
            SELECT u FROM Users u
            JOIN FETCH u.role r
            WHERE u.deletedAt IS NULL
              AND (:keyword IS NULL
                   OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR u.phone LIKE CONCAT('%', :keyword, '%'))
              AND (:role IS NULL OR LOWER(r.code) = LOWER(:role))
              AND (:status IS NULL OR u.statusCode = :status)
            """,
            countQuery = """
            SELECT COUNT(u) FROM Users u
            JOIN u.role r
            WHERE u.deletedAt IS NULL
              AND (:keyword IS NULL
                   OR LOWER(u.fullName) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR LOWER(u.email) LIKE LOWER(CONCAT('%', :keyword, '%'))
                   OR u.phone LIKE CONCAT('%', :keyword, '%'))
              AND (:role IS NULL OR LOWER(r.code) = LOWER(:role))
              AND (:status IS NULL OR u.statusCode = :status)
            """)
    Page<Users> searchAccounts(
            @Param("keyword") String keyword,
            @Param("role") String role,
            @Param("status") UserStatus status,
            Pageable pageable);

    @Query("""
            SELECT u FROM Users u
            JOIN FETCH u.role r
            WHERE u.deletedAt IS NULL
              AND u.statusCode = :status
              AND r.code IN :roleCodes
            ORDER BY u.fullName ASC
            """)
    List<Users> findScheduleStaffOptions(
            @Param("status") UserStatus status,
            @Param("roleCodes") Collection<String> roleCodes);
}
