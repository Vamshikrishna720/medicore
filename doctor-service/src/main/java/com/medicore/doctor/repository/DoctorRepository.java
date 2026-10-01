package com.medicore.doctor.repository;

import com.medicore.doctor.entity.Doctor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;

public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByUserId(Long userId);

    boolean existsByUserId(Long userId);

    Optional<Doctor> findByIdAndActiveTrue(Long id);

    /**
     * Public search: only active + available doctors, optional filters.
     * Written as JPQL with all-optional params; specialization uses an index.
     */
    @Query("""
            SELECT d FROM Doctor d
            WHERE d.active = true
              AND d.available = true
              AND (:specialization IS NULL OR LOWER(d.specialization) = LOWER(:specialization))
              AND (:minExperience IS NULL OR d.experienceYears >= :minExperience)
              AND (:maxFee IS NULL OR d.consultationFee <= :maxFee)
            """)
    Page<Doctor> search(@Param("specialization") String specialization,
                        @Param("minExperience") Integer minExperience,
                        @Param("maxFee") java.math.BigDecimal maxFee,
                        Pageable pageable);

    @Query("SELECT DISTINCT d.specialization FROM Doctor d WHERE d.active = true ORDER BY d.specialization")
    java.util.List<String> findDistinctSpecializations();
}
