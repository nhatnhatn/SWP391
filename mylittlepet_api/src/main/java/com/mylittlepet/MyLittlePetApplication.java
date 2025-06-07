package com.mylittlepet;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class MyLittlePetApplication {

    public static void main(String[] args) {
        SpringApplication.run(MyLittlePetApplication.class, args);
    }

}
