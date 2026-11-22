FROM node:22-alpine
RUN apk add --no-cache libc6-compat openssl curl
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .

# Build-time environment variables for Next.js build and Prisma client generation
ENV DATABASE_URL="postgresql://build_user:build_pass@localhost:5432/build_db?schema=public"
ENV NEXT_PUBLIC_APP_URL="http://localhost:3000"

RUN npx prisma generate
RUN npm run build

EXPOSE 3000
ENV PORT=3000
ENV NODE_ENV=production

CMD ["npm", "start"]
