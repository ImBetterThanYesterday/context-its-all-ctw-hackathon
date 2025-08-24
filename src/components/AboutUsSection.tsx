
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Upload, Github, Linkedin, Twitter, Mail, Plus, Edit2 } from 'lucide-react';

const AboutUsSection = () => {
  const [teamMembers, setTeamMembers] = useState([
    {
      id: 1,
      name: 'Cristobal Valencia',
      role: 'Senior Developer',
      description: 'Desarrollador Full Stack especializado en React y Node.js, arquitecto de RappiPage.',
      image: './lovable-uploads/cristobal.png',
      socials: {
        linkedin: 'www.linkedin.com/in/cristobalvalenciaceron',
        github: 'https://github.com/DevCristobalvc'
      }
    },
    {
      id: 2,
      name: 'Gustavo Chipantiza',
      role: 'AI Engineer',
      description: 'Data & AI Engineer specializing in processing big data, building robust data pipelines, machine learning, and LLM applications.',
      image: './lovable-uploads/gustavo.png',
      socials: {
        linkedin: 'https://linkedin.com/in/maria-rodriguez',
        github: 'https://github.com/maria-ai'
      }
    }
  ]);

  const [isAddingMember, setIsAddingMember] = useState(false);
  const [newMember, setNewMember] = useState({
    name: '',
    role: '',
    description: '',
    image: '',
    socials: { linkedin: '', github: '', twitter: '' }
  });

  const handleAddMember = () => {
    if (newMember.name && newMember.role) {
      setTeamMembers([...teamMembers, { ...newMember, id: Date.now() }]);
      setNewMember({ name: '', role: '', description: '', image: '', socials: { linkedin: '', github: '', twitter: '' } });
      setIsAddingMember(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-4xl font-display font-black rappi-text-gradient uppercase tracking-wide">
          Conoce al Equipo RappiPage
        </h2>
        <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
          Somos un equipo apasionado de Rappi dedicado a revolucionar la forma en que los equipos 
          de producto convierten ideas en interfaces funcionales.
        </p>
      </div>

      {/* Mission */}
      <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-primary/10">
        <CardHeader>
          <CardTitle className="text-2xl font-display font-bold text-center">
            Nuestra Misión
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-lg text-muted-foreground leading-relaxed">
            Acelerar el proceso de desarrollo de productos digitales en Rappi mediante herramientas 
            de IA que convierten documentos PRD en prototipos funcionales, reduciendo el tiempo 
            de ideación a implementación de semanas a minutos.
          </p>
        </CardContent>
      </Card>

      {/* Team Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {teamMembers.map((member) => (
          <Card key={member.id} className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
            <CardHeader className="text-center">
              <div className="relative w-24 h-24 mx-auto mb-4">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full rounded-full object-cover border-4 border-primary/20"
                />
                <Button
                  size="sm"
                  variant="ghost"
                  className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full rappi-button"
                >
                  <Upload className="w-4 h-4" />
                </Button>
              </div>
              <CardTitle className="text-xl font-bold">{member.name}</CardTitle>
              <Badge className="rappi-gradient text-white font-medium">
                {member.role}
              </Badge>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                {member.description}
              </p>
              <div className="flex justify-center space-x-3">
                {member.socials.linkedin && (
                  <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                    <Linkedin className="w-4 h-4" />
                  </Button>
                )}
                {member.socials.github && (
                  <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                    <Github className="w-4 h-4" />
                  </Button>
                )}
                <Button size="sm" variant="ghost" className="w-8 h-8 p-0">
                  <Mail className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default AboutUsSection;
