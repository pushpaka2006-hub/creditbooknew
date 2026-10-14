
package com.example.demo.customer;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class CustomerService {

    private final CustomerRepository repository;

    public CustomerService(CustomerRepository repository) {
        this.repository = repository;
    }

    public List<Customer> getAllCustomers() {
        return repository.findAll();
    }

    public Customer getCustomer(Long id) {
        return repository.findById(id)
                .orElseThrow(() ->
                    new RuntimeException("Customer not found: " + id));
    }

    public Customer addCustomer(Customer customer) {
        customer.setId(null);
        customer.setName(customer.getName().trim());
        return repository.save(customer);
    }

    public Customer updateCustomer(Long id, Customer input) {
        Customer existing = getCustomer(id);

        existing.setName(input.getName().trim());
        existing.setPhone(input.getPhone());
        existing.setAddress(input.getAddress());

        return repository.save(existing);
    }

    public void deleteCustomer(Long id) {
        Customer customer = getCustomer(id);
        repository.delete(customer);
    }
}
