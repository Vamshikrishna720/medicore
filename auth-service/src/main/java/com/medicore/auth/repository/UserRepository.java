package com.medicore.auth.repository;

import com.medicore.auth.entity.Role;
import com.medicore.auth.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    /**
     * Paginated admin search over email prefix/substring (index-backed via idx_users_email).
     */
    @Query("SELECT u FROM User u WHERE LOWER(u.email) LIKE LOWER(CONCAT('%', :term, '%'))")
    Page<User> searchByEmail(@Param("term") String term, Pageable pageable);
}
