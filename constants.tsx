
import React from 'react';
import type { TestRun } from './types';
import { Status, Platform, Browser } from './types';

export const MOCK_TEST_RUNS: TestRun[] = [
  {
    id: 'run-12345',
    name: 'User Login and Authentication Flow',
    status: Status.Passed,
    platform: Platform.Ubuntu,
    browser: Browser.Chrome,
    duration: '1m 23s',
    timestamp: '2024-07-29T10:30:00Z',
    commit: 'a1b2c3d',
    triggeredBy: 'jane.doe',
    executionMode: 'headless',
    videoUrl: 'https://picsum.photos/seed/video1/1280/720.mp4', // Placeholder
    screenshots: [
      { name: 'login-page.png', url: 'https://picsum.photos/seed/ss1/1280/720' },
      { name: 'dashboard-view.png', url: 'https://picsum.photos/seed/ss2/1280/720' },
    ],
    logs: [
      { level: 'info', message: 'Test execution started.', timestamp: '10:30:01' },
      { level: 'info', message: 'Navigated to login page.', timestamp: '10:30:05' },
      { level: 'info', message: 'Entered credentials for jane.doe.', timestamp: '10:30:10' },
      { level: 'info', message: 'Login successful, redirected to dashboard.', timestamp: '10:30:15' },
      { level: 'info', message: 'Verified dashboard elements.', timestamp: '10:31:00' },
      { level: 'info', message: 'Test finished successfully.', timestamp: '10:31:23' },
    ],
  },
  {
    id: 'run-67890',
    name: 'Checkout Process with Invalid Coupon',
    status: Status.Failed,
    platform: Platform.Windows,
    browser: Browser.Edge,
    duration: '0m 45s',
    timestamp: '2024-07-29T10:25:00Z',
    commit: 'e4f5g6h',
    triggeredBy: 'john.smith',
    executionMode: 'headful',
    videoUrl: 'https://picsum.photos/seed/video2/1280/720.mp4',
    screenshots: [
        { name: 'cart-view.png', url: 'https://picsum.photos/seed/ss3/1280/720' },
        { name: 'failure-coupon-error.png', url: 'https://picsum.photos/seed/ss4/1280/720' },
    ],
    logs: [
        { level: 'info', message: 'Test execution started.', timestamp: '10:25:01' },
        { level: 'info', message: 'Added items to cart.', timestamp: '10:25:10' },
        { level: 'info', message: 'Applied invalid coupon "FREE100".', timestamp: '10:25:20' },
        { level: 'error', message: 'Assertion failed: Expected error message "Invalid coupon code" not found.', timestamp: '10:25:44' },
    ],
  },
  {
    id: 'run-abcde',
    name: 'API Test: /v1/users Endpoint',
    status: Status.Running,
    platform: Platform.MacOS,
    browser: Browser.Firefox,
    duration: 'In Progress',
    timestamp: '2024-07-29T11:00:00Z',
    commit: 'i7j8k9l',
    triggeredBy: 'ci-pipeline',
    executionMode: 'headless',
    videoUrl: '',
    screenshots: [],
    logs: [
        { level: 'info', message: 'Test execution started for /v1/users.', timestamp: '11:00:01' },
        { level: 'info', message: 'Sending GET request...', timestamp: '11:00:02' },
    ],
  },
  {
    id: 'run-fghij',
    name: 'Image Upload and Verification',
    status: Status.Passed,
    platform: Platform.Ubuntu,
    browser: Browser.Chrome,
    duration: '2m 10s',
    timestamp: '2024-07-29T09:15:00Z',
    commit: 'm0n1p2q',
    triggeredBy: 'jane.doe',
    executionMode: 'headless',
    videoUrl: 'https://picsum.photos/seed/video3/1280/720.mp4',
    screenshots: [
      { name: 'upload-modal.png', url: 'https://picsum.photos/seed/ss5/1280/720' },
      { name: 'uploaded-image-gallery.png', url: 'https://picsum.photos/seed/ss6/1280/720' },
    ],
    logs: [
      { level: 'info', message: 'Test started.', timestamp: '09:15:01' },
      { level: 'info', message: 'Image selected for upload.', timestamp: '09:15:30' },
      { level: 'info', message: 'Image successfully uploaded and verified.', timestamp: '09:17:10' },
    ],
  },
];


// Icons
export const LogoIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" />
  </svg>
);
export const DashboardIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
  </svg>
);
export const AiIcon = (props: React.SVGProps<SVGSVGElement>) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
  </svg>
);
export const WindowsIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M3,12V6.75L9,5.43V11.91L3,12M21,4.91L10,3.5V11.84L21,12M3,13L9,13.09V19.57L3,18.25V13M21,13L10,13.16V20.5L21,19.09V13Z" /></svg>
);
export const AppleIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M20.5,14.5C20.5,15.2,20.2,16.4,19.6,17.5C18.8,18.9,17.7,20,16.5,20C15.8,20,15,19.6,14.3,19.1C13.5,18.5,12.9,17.8,12.5,17.8C12,17.8,11.5,18.5,10.7,19.1C9.9,19.6,9.1,20,8.5,20C7.3,20,6.2,18.9,5.4,17.5C4.8,16.4,4.5,15.2,4.5,14.5C4.5,12.1,6.1,10.4,8.5,10.4C9.8,10.4,11,11.1,11.8,12.1C12.3,12.7,12.7,13.4,13.3,13.4C13.8,13.4,14.2,12.7,14.8,12.1C15.6,11.1,16.7,10.4,18,10.4C20.4,10.4,22,12.1,22,14.5C22,14.5,20.5,14.5,20.5,14.5M15.5,5.5C15.9,5.1,16.1,4.5,16,4C15.2,2.9,14,2.4,12.8,2.5C12,2.5,11.1,2.9,10.5,3.5C10.1,3.9,9.9,4.5,10,5C10.8,6.1,12,6.6,13.2,6.5C14,6.5,14.9,6.1,15.5,5.5" /></svg>
);
export const UbuntuIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg {...props} viewBox="0 0 24 24" fill="currentColor"><path d="M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M16.5,5.5A2,2 0 0,1 18.5,7.5A2,2 0 0,1 16.5,9.5C15.4,9.5 15.1,8.4 15.1,7.5C15.1,6.6 15.4,5.5 16.5,5.5M7.5,5.5A2,2 0 0,1 9.5,7.5A2,2 0 0,1 7.5,9.5C6.4,9.5 6.1,8.4 6.1,7.5C6.1,6.6 6.4,5.5 7.5,5.5M16.5,14.9C15.4,14.9 15.1,16 15.1,16.9C15.1,17.8 15.4,18.9 16.5,18.9A2,2 0 0,0 18.5,16.9A2,2 0 0,0 16.5,14.9M7.5,14.9A2,2 0 0,0 5.5,16.9A2,2 0 0,0 7.5,18.9C8.6,18.9 8.9,17.8 8.9,16.9C8.9,16 8.6,14.9 7.5,14.9Z" /></svg>
);
