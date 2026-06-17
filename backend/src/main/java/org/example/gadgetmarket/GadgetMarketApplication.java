package org.example.gadgetmarket;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;

@SpringBootApplication
@EnableScheduling
@EnableMethodSecurity
public class GadgetMarketApplication {

    public static void main(String[] args) {
        SpringApplication.run(GadgetMarketApplication.class, args);
    }
}
