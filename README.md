# Country Currency API

A NestJS API to fetch country and currency information.

## API Endpoints

Base URL: `http://localhost:3000`

### Authentication

#### Login
Returns a JWT access token.

- **URL**: `/login`
- **Method**: `POST`
- **Body**:
```json
{
    "username": "admin",
    "password": "password123"
}
```

### Countries

#### Get Country Info (GET)
Fetch country information by name.

- **URL**: `/countries/:name`
- **Method**: `GET`
- **URL Params**:
    - `name`: Name of the country (e.g., `Rwanda`)
- **Headers**:
    - `Authorization`: `Bearer <jwt_token>`

#### Get Country Info (POST)
Fetch country information by providing name in the body.

- **URL**: `/countries`
- **Method**: `POST`
- **Headers**:
    - `Authorization`: `Bearer <jwt_token>`
- **Body**:
```json
{
    "country": "Rwanda"
}
```

### System

#### Health Check
Simple hello world response.

- **URL**: `/`
- **Method**: `GET`