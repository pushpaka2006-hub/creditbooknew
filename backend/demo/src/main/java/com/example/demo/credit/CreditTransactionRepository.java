
package com.example.demo.credit;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;

public interface CreditTransactionRepository
        extends JpaRepository<CreditTransaction, Long> {

    List<CreditTransaction> findByCustomerIdOrderByCreatedAtDesc(
            Long customerId);
}
