import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ExecutionContext, NotFoundException } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from './../src/app.module';
import { JwtAuthGuard } from './../src/auth/guards/jwt-auth.guard';
import { CountriesService } from './../src/countries/countries.service';

describe('CountriesController (e2e)', () => {
    let app: INestApplication;

    const mockCountriesService = {
        getCountryInfo: (name: string) => {
            if (name === 'Rwanda') {
                return Promise.resolve({
                    name: 'Rwanda',
                    population: 12952218,
                    currencies: [{ code: 'RWF', name: 'Rwandan franc', symbol: 'Fr', rate: 1 }]
                });
            }
            throw new NotFoundException('Country not found');
        }
    };

    beforeEach(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [AppModule],
        })
            .overrideGuard(JwtAuthGuard)
            .useValue({
                canActivate: (context: ExecutionContext) => true,
            })
            .overrideProvider(CountriesService)
            .useValue(mockCountriesService)
            .compile();

        app = moduleFixture.createNestApplication();
        await app.init();
    });

    afterAll(async () => {
        await app.close();
    });

    it('/countries (POST) should return country info', () => {
        return request(app.getHttpServer())
            .post('/countries')
            .send({ country: 'Rwanda' })
            .expect(201)
            .expect((res) => {
                expect(res.body).toHaveProperty('name', 'Rwanda');
                expect(res.body).toHaveProperty('currencies');
            });
    });

    it('/countries (POST) should return 404 for invalid country', () => {
        return request(app.getHttpServer())
            .post('/countries')
            .send({ country: 'InvalidCountryName123' })
            .expect(404);
    });
});
