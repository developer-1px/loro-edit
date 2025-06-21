# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a React + TypeScript + Vite application that integrates with Loro CRDT (Conflict-free Replicated Data Type) for collaborative editing capabilities. The project uses `loro-crdt` library for distributed data synchronization.

## Development Commands

- `pnpm dev` - Start development server with hot module replacement
- `pnpm build` - Build for production (runs TypeScript compiler first, then Vite build)
- `pnpm lint` - Run ESLint on the codebase
- `pnpm preview` - Preview production build locally

## Testing Convention

**IMPORTANT**: When testing changes, always use `pnpm build` instead of `pnpm dev` to ensure TypeScript compilation and proper validation of the changes. This catches type errors and ensures production compatibility.

## Package Manager

This project uses **pnpm** as the package manager (evidenced by `pnpm-lock.yaml`). Use `pnpm` commands instead of `npm` or `yarn`.

## Architecture

- **Frontend Framework**: React 19 with TypeScript
- **Build Tool**: Vite with SWC plugin for fast compilation
- **Core Dependency**: `loro-crdt` - A high-performance CRDT library for collaborative applications
- **Linting**: ESLint with TypeScript and React-specific rules
- **Entry Point**: `src/main.tsx` renders the React app into `index.html`
- **Main Component**: `src/App.tsx` - Currently contains boilerplate Vite + React template

## TypeScript Configuration

The project uses a composite TypeScript setup with separate configs:
- `tsconfig.json` - Root configuration referencing app and node configs
- `tsconfig.app.json` - Application-specific TypeScript settings
- `tsconfig.node.json` - Node.js/build tool specific settings

## Loro CRDT Integration

The project includes `loro-crdt` as a primary dependency, suggesting this is intended to be a collaborative editing application. When working with Loro:
- Loro provides conflict-free data synchronization
- Suitable for real-time collaborative features like document editing, drawing, or data sharing
- Check Loro documentation for API usage patterns when implementing collaborative features