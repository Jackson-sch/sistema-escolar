const { PrismaClient } = require('../src/generated/prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed de permisos y usuario administrador...');

  // Definir permisos por módulo
  const permisos = [
    // ESTUDIANTES
    {
      codigo: 'ESTUDIANTE_VER',
      nombre: 'Ver estudiantes',
      descripcion: 'Permite visualizar información de estudiantes',
      modulo: 'ESTUDIANTES'
    },
    {
      codigo: 'ESTUDIANTE_CREAR',
      nombre: 'Crear estudiantes',
      descripcion: 'Permite registrar nuevos estudiantes',
      modulo: 'ESTUDIANTES'
    },
    {
      codigo: 'ESTUDIANTE_ACTUALIZAR',
      nombre: 'Actualizar estudiantes',
      descripcion: 'Permite modificar información de estudiantes',
      modulo: 'ESTUDIANTES'
    },
    {
      codigo: 'ESTUDIANTE_ELIMINAR',
      nombre: 'Eliminar estudiantes',
      descripcion: 'Permite eliminar estudiantes del sistema',
      modulo: 'ESTUDIANTES'
    },
    {
      codigo: 'ESTUDIANTE_MATRICULAR',
      nombre: 'Matricular estudiantes',
      descripcion: 'Permite matricular estudiantes en cursos y niveles',
      modulo: 'ESTUDIANTES'
    },
    {
      codigo: 'ESTUDIANTE_CAMBIAR_SECCION',
      nombre: 'Cambiar sección de estudiante',
      descripcion: 'Permite cambiar estudiantes entre secciones',
      modulo: 'ESTUDIANTES'
    },

    // ACADEMICO
    {
      codigo: 'NOTA_VER',
      nombre: 'Ver notas',
      descripcion: 'Permite visualizar notas de estudiantes',
      modulo: 'ACADEMICO'
    },
    {
      codigo: 'NOTA_CREAR',
      nombre: 'Crear notas',
      descripcion: 'Permite registrar notas de evaluaciones',
      modulo: 'ACADEMICO'
    },
    {
      codigo: 'NOTA_ACTUALIZAR',
      nombre: 'Actualizar notas',
      descripcion: 'Permite modificar notas existentes',
      modulo: 'ACADEMICO'
    },
    {
      codigo: 'NOTA_ELIMINAR',
      nombre: 'Eliminar notas',
      descripcion: 'Permite eliminar notas del sistema',
      modulo: 'ACADEMICO'
    },
    {
      codigo: 'EVALUACION_CREAR',
      nombre: 'Crear evaluaciones',
      descripcion: 'Permite crear y configurar evaluaciones',
      modulo: 'ACADEMICO'
    },
    {
      codigo: 'ASISTENCIA_REGISTRAR',
      nombre: 'Registrar asistencia',
      descripcion: 'Permite registrar asistencia de estudiantes',
      modulo: 'ACADEMICO'
    },
    {
      codigo: 'HORARIO_GESTIONAR',
      nombre: 'Gestionar horarios',
      descripcion: 'Permite crear y modificar horarios de clases',
      modulo: 'ACADEMICO'
    },

    // ADMINISTRATIVO
    {
      codigo: 'PAGO_VER',
      nombre: 'Ver pagos',
      descripcion: 'Permite visualizar información de pagos',
      modulo: 'ADMINISTRATIVO'
    },
    {
      codigo: 'PAGO_CREAR',
      nombre: 'Crear pagos',
      descripcion: 'Permite registrar pagos y generar recibos',
      modulo: 'ADMINISTRATIVO'
    },
    {
      codigo: 'DOCUMENTO_VERIFICAR',
      nombre: 'Verificar documentos',
      descripcion: 'Permite verificar y validar documentos de estudiantes',
      modulo: 'ADMINISTRATIVO'
    },
    {
      codigo: 'REPORTE_GENERAR',
      nombre: 'Generar reportes',
      descripcion: 'Permite generar reportes del sistema',
      modulo: 'ADMINISTRATIVO'
    },
    {
      codigo: 'USUARIO_GESTIONAR',
      nombre: 'Gestionar usuarios',
      descripcion: 'Permite crear, modificar y eliminar usuarios',
      modulo: 'ADMINISTRATIVO'
    },

    // INSTITUCIONAL
    {
      codigo: 'INSTITUCION_CONFIGURAR',
      nombre: 'Configurar institución',
      descripcion: 'Permite modificar configuración general de la institución',
      modulo: 'INSTITUCIONAL'
    },
    {
      codigo: 'PERIODO_ACADEMICO_CREAR',
      nombre: 'Crear período académico',
      descripcion: 'Permite crear y gestionar períodos académicos',
      modulo: 'INSTITUCIONAL'
    },
    {
      codigo: 'NIVEL_ACADEMICO_GESTIONAR',
      nombre: 'Gestionar niveles académicos',
      descripcion: 'Permite crear y gestionar niveles y grados académicos',
      modulo: 'INSTITUCIONAL'
    },
    {
      codigo: 'AREA_CURRICULAR_CREAR',
      nombre: 'Crear área curricular',
      descripcion: 'Permite crear y gestionar áreas curriculares',
      modulo: 'INSTITUCIONAL'
    },

    // COMUNICACIONES
    {
      codigo: 'ANUNCIO_CREAR',
      nombre: 'Crear anuncios',
      descripcion: 'Permite crear y publicar anuncios',
      modulo: 'COMUNICACIONES'
    },
    {
      codigo: 'EVENTO_CREAR',
      nombre: 'Crear eventos',
      descripcion: 'Permite crear y gestionar eventos',
      modulo: 'COMUNICACIONES'
    },
    {
      codigo: 'NOTIFICACION_ENVIAR',
      nombre: 'Enviar notificaciones',
      descripcion: 'Permite enviar notificaciones a usuarios',
      modulo: 'COMUNICACIONES'
    }
  ];

  // Crear permisos usando upsert para evitar duplicados
  console.log('📝 Creando permisos...');
  
  for (const permiso of permisos) {
    await prisma.permiso.upsert({
      where: { codigo: permiso.codigo },
      update: {
        nombre: permiso.nombre,
        descripcion: permiso.descripcion,
        modulo: permiso.modulo,
        activo: true
      },
      create: permiso
    });
    console.log(`✅ Permiso creado: ${permiso.codigo} - ${permiso.nombre}`);
  }

  // Configurar permisos por defecto para cada rol
  const permisosDefaultPorRol = {
    estudiante: [
      'NOTA_VER',
      'ASISTENCIA_REGISTRAR' // Solo para ver su propia asistencia
    ],
    profesor: [
      'ESTUDIANTE_VER',
      'NOTA_VER',
      'NOTA_CREAR',
      'NOTA_ACTUALIZAR',
      'EVALUACION_CREAR',
      'ASISTENCIA_REGISTRAR',
      'HORARIO_GESTIONAR'
    ],
    administrativo: [
      'ESTUDIANTE_VER',
      'ESTUDIANTE_CREAR',
      'ESTUDIANTE_ACTUALIZAR',
      'ESTUDIANTE_MATRICULAR',
      'PAGO_VER',
      'PAGO_CREAR',
      'DOCUMENTO_VERIFICAR',
      'REPORTE_GENERAR'
    ],
    director: [
      // El director tiene todos los permisos
      ...permisos.map(p => p.codigo)
    ],
    padre: [
      'ESTUDIANTE_VER', // Solo de sus hijos
      'NOTA_VER',       // Solo de sus hijos
      'PAGO_VER'        // Solo de sus hijos
    ]
  };

  console.log('🔐 Asignando permisos por defecto a roles...');

  for (const [rol, codigosPermisos] of Object.entries(permisosDefaultPorRol)) {
    for (const codigoPermiso of codigosPermisos) {
      try {
        const permiso = await prisma.permiso.findUnique({
          where: { codigo: codigoPermiso }
        });

        if (permiso) {
          await prisma.rolPermiso.upsert({
            where: {
              rol_permisoId: {
                rol: rol,
                permisoId: permiso.id
              }
            },
            update: {},
            create: {
              rol: rol,
              permisoId: permiso.id
            }
          });
          console.log(`✅ Permiso ${codigoPermiso} asignado al rol ${rol}`);
        }
      } catch (error) {
        console.error(`❌ Error asignando permiso ${codigoPermiso} al rol ${rol}:`, error.message);
      }
    }
  }

  // 🎯 CREAR USUARIO ADMINISTRADOR
  console.log('👤 Creando usuario administrador...');
  
  // Datos del administrador
  const adminData = {
    email: 'admin@sistema.edu.pe',
    password: await bcrypt.hash('Admin123!', 10), // Cambia esta contraseña
    name: 'Administrador del Sistema',
    apellidoPaterno: 'Sistema',
    apellidoMaterno: 'Administrador',
    dni: '12345678',
    role: 'director', // Rol con más permisos
    cargo: 'administrador',
    estado: 'activo',
    fechaNacimiento: new Date('1980-01-01'),
    sexo: 'M',
    nacionalidad: 'PERUANA',
    telefono: '999999999',
    codigoEstudiante: 'ADMIN001',
    fechaIngreso: new Date()
  };

  // Crear el usuario administrador
  const adminUser = await prisma.user.upsert({
    where: { email: adminData.email },
    update: {
      password: adminData.password,
      name: adminData.name,
      estado: 'activo'
    },
    create: adminData
  });

  console.log(`✅ Usuario administrador creado: ${adminUser.email}`);

  // 🔑 ASIGNAR TODOS LOS PERMISOS AL ADMINISTRADOR
  console.log('🔑 Asignando todos los permisos al administrador...');
  
  // Obtener todos los permisos creados
  const todosLosPermisos = await prisma.permiso.findMany({
    where: { activo: true }
  });

  // Asignar cada permiso al usuario administrador
  for (const permiso of todosLosPermisos) {
    try {
      await prisma.usuarioPermiso.upsert({
        where: {
          usuarioId_permisoId: {
            usuarioId: adminUser.id,
            permisoId: permiso.id
          }
        },
        update: {
          activo: true,
          fechaInicio: new Date()
        },
        create: {
          usuarioId: adminUser.id,
          permisoId: permiso.id,
          activo: true,
          fechaInicio: new Date()
        }
      });
      console.log(`✅ Permiso ${permiso.codigo} asignado al administrador`);
    } catch (error) {
      console.error(`❌ Error asignando permiso ${permiso.codigo} al administrador:`, error.message);
    }
  }

  console.log('🎉 Seed completado exitosamente!');
  console.log(`📊 Total de permisos creados: ${permisos.length}`);
  console.log(`👥 Roles configurados: ${Object.keys(permisosDefaultPorRol).length}`);
  console.log('👤 Usuario administrador creado:');
  console.log(`   📧 Email: ${adminUser.email}`);
  console.log(`   🔑 Contraseña: Admin123! (¡CAMBIAR INMEDIATAMENTE!)`);
  console.log(`   🆔 ID: ${adminUser.id}`);
  console.log(`   🔐 Permisos asignados: ${todosLosPermisos.length}`);
  
  console.log('\n⚠️  IMPORTANTE: Cambia la contraseña del administrador después del primer login!');
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });