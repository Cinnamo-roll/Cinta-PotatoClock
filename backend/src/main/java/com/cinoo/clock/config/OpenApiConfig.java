package com.cinoo.clock.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class OpenApiConfig {
    @Bean
    OpenAPI clockOpenApi() {
        return new OpenAPI().info(new Info()
                .title("土豆时钟 API")
                .description("移动端 Web 时间管理后端接口")
                .version("v1"));
    }
}
