package com.garibas.backend.repository;

import com.garibas.backend.entity.CustomerOrder;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CustomerOrderRepository extends JpaRepository<CustomerOrder, Long> {
    List<CustomerOrder> findAllByUserIdOrderByCreatedAtDesc(Long userId);
}
