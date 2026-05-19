import React from 'react';
import { Body, Button, Container, Head, Heading, Html, Preview, Section, Text, Img } from '@react-email/components';

export default function EscalationNotice({
  employeeName = 'Team Member',
  goalTitle = 'Goal',
  actionLink = 'https://milestone.example.com',
  deadline = 'N/A',
  portalUrl = 'https://milestone.example.com'
}) {
  return (
    <Html>
      <Head />
      <Preview>Milestone notification</Preview>
      <Body style={{ backgroundColor: '#f8fafc', fontFamily: 'Arial, sans-serif', padding: '24px' }}>
        <Container style={{ backgroundColor: '#ffffff', borderRadius: '12px', padding: '24px' }}>
          <Img src="https://via.placeholder.com/180x48?text=Milestone" alt="Milestone" width="180" />
          <Heading>EscalationNotice</Heading>
          <Text>Hello {employeeName},</Text>
          <Text>Goal: {goalTitle}</Text>
          <Text>Deadline: {deadline}</Text>
          <Section>
            <Button href={actionLink} style={{ backgroundColor: '#1d4ed8', color: '#fff', padding: '12px 20px', borderRadius: '8px' }}>
              Open Milestone Portal
            </Button>
          </Section>
          <Text style={{ color: '#64748b', marginTop: '24px' }}>Portal: {portalUrl}</Text>
        </Container>
      </Body>
    </Html>
  );
}
