<template>
  <ion-page>
    <ion-header>
      <ion-toolbar>
        <ion-title>Estadísticas</ion-title>
      </ion-toolbar>
    </ion-header>

    <ion-content :fullscreen="true">
      <ion-refresher slot="fixed" @ionRefresh="reloadPage">
        <ion-refresher-content></ion-refresher-content>
      </ion-refresher>
      <ion-header collapse="condense">
        <ion-toolbar>
          <ion-title size="large">Tab 1</ion-title>
        </ion-toolbar>
      </ion-header>

      <div v-if="!hasRoutes" class="no-routes">
        <p>No hay rutas disponibles.</p>
      </div>

      <div v-if="hasRoutes">
        <ion-card>
          <ion-card-header>
            <ion-card-title>Distancia recorrida</ion-card-title>
            <br />
          </ion-card-header>
          <ion-card-content>
            <div>
              <canvas ref="lineChart"></canvas>
            </div>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Duración total en tus últimas rutas</ion-card-title>
            <br />
          </ion-card-header>
          <ion-card-content>
            <canvas ref="barChart"></canvas>
          </ion-card-content>
        </ion-card>

        <ion-card>
          <ion-card-header>
            <ion-card-title>Deportes totales</ion-card-title>
            <br />
          </ion-card-header>
          <ion-card-content>
            <div class="chart-container">
              <canvas ref="doughnutChart"></canvas>
            </div>
          </ion-card-content>
        </ion-card>
        </div>

    </ion-content>
  </ion-page>
</template>

<script setup lang="ts">
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonCardContent, IonCardHeader, IonCard, IonCardTitle, IonRefresherContent, IonRefresher
} from '@ionic/vue';
import { onMounted, ref } from 'vue';
import {
  Chart,
  LineController,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  ChartData,
  ChartOptions,
  DoughnutController, ArcElement, BarController, BarElement, Legend,
} from 'chart.js';

//componentes necesarios para las gráficas
Chart.register(LineController, LineElement, PointElement, LinearScale, CategoryScale, DoughnutController, ArcElement,BarController,BarElement, Legend);


interface Route {
  id: number;
  name: string;
  created_at: string;
  distance: string;
  duration: string;
  path: { lat: number; lng: number }[];
  sport: string;
  pace: string;
}

const lineChart = ref<HTMLCanvasElement | null>(null);
const doughnutChart = ref<HTMLCanvasElement | null>(null);
const barChart = ref<HTMLCanvasElement | null>(null);
const routes = ref<Route[]>([]);
const hasRoutes = ref(true);
const reloadPage = () => {
  window.location.reload();
};

const parseDistance = (distanceText: string): number => {
  if (distanceText.includes('km')) {
    return parseFloat(distanceText);
  } else if (distanceText.includes('m')) {
    const meters = parseFloat(distanceText.replace('m', ''));
    return meters / 1000;
  }
  return 0;
};

const parseDuration = (durationText: string): number => {
  const timeParts = durationText.split(/h|min|s/).filter(Boolean).map(Number);
  let totalSeconds = 0;

  if (durationText.includes('h')) {
    totalSeconds += timeParts[0] * 3600;
    timeParts.shift();
  }
  if (durationText.includes('min')) {
    totalSeconds += timeParts[0] * 60;
    timeParts.shift();
  }
  if (durationText.includes('s')) {
    totalSeconds += timeParts[0];
  }

  return totalSeconds;
};

const fetchRoutes = async () => {
  try {
    const response = await fetch(`https://spotrack.dev-alicenter.es/api/route`, {
      method: 'GET',
      credentials: 'include',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('authToken')}`,
        'Content-Type': 'application/json'
      }
    });

    if (response.ok) {
      const data = await response.json();
      routes.value = data.data.map((route: any) => ({
        ...route,
        path: JSON.parse(route.path)
      }));
      hasRoutes.value = routes.value.length > 0;
      if (hasRoutes.value) {
        renderDoughnut();
        renderBarChart();
        renderLineChart();
      }
    } else {
      console.error('Error al obtener las rutas');
      hasRoutes.value = false;
    }
  } catch (error) {
    console.error('Error en la solicitud:', error);
    hasRoutes.value = false;
  }
};

const getDistanceRoute = () => {
  const distanceRoute: { name: string; distance: number }[] = [];
  routes.value.forEach(route => {
    const routeName = route.name;
    const distanceKm = parseDistance(route.distance);
    distanceRoute.push({ name: routeName, distance: distanceKm });
  });
  return distanceRoute;
};

const getDurationRoute = () => {
  const durationRoute: { name: string; duration: number }[] = [];
  routes.value.forEach(route => {
    const routeName = route.name;
    const duration = parseDuration(route.duration);
    durationRoute.push({ name: routeName, duration: duration });
    //console.log(durationRoute);
  });
  return durationRoute;
};

const renderLineChart = () => {
  if (lineChart.value && routes.value.length > 0) {

    const distanceRoute = getDistanceRoute();
    const labels = distanceRoute.map(route => route.name);
    const data = distanceRoute.map(route => route.distance);

    const lineData = {
      labels: labels,
      datasets: [
        {
          label: 'Distancia (km)',
          data,
          backgroundColor: 'rgba(255,0,0,0.2)',
          borderColor: 'rgb(255,39,22)',
          borderWidth: 1
        }
      ]
    };

    new Chart(lineChart.value, {
      type: 'line',
      data: lineData,
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            position: 'top'
          }
        }
      }
    });
  }
};

const getRoutesBySport = () => {
  const sportsCount: Record<string, number> = {};
  routes.value.forEach(route => {
    const sport = route.sport;
    sportsCount[sport] = (sportsCount[sport] || 0) + 1;
  });
  return sportsCount;
};

const renderDoughnut = () => {
  if (doughnutChart.value && routes.value.length > 0) {
    const sportsData = getRoutesBySport();
    const labels = Object.keys(sportsData);
    const data = Object.values(sportsData);
    const doughnutData: ChartData<'doughnut'> = {
      labels: labels,
      datasets: [{
        label: 'Deportes',
        data: data,
        backgroundColor: [
          'rgb(255, 99, 132)',
          'rgb(54, 162, 235)',
          'rgb(255, 205, 86)',
          'rgb(75, 192, 192)',
          'rgb(153, 102, 255)',
          'rgb(201, 203, 207)'
        ],
        hoverOffset: 4
      }]
    };
    const config: ChartOptions<'doughnut'> = {
      responsive: true,
      plugins: {
        legend: {
          display: true,
          position: 'bottom',

          labels: {
            boxWidth: 20,
            padding: 20,
            font: {
              size: 14
            },
          },
        },
      }
    };
    new Chart(doughnutChart.value, {
      type: 'doughnut',
      data: doughnutData,
      options: config
    });
  }
}

const renderBarChart = () => {
  if (barChart.value && routes.value.length > 0) {
    const durationRoute = getDurationRoute();
    const labels = durationRoute.map(route => route.name);
    const data = durationRoute.map(route => route.duration);

    const barData = {
      labels: labels,
      datasets: [
        {
          label: 'Tiempo',
          data,
          backgroundColor: 'rgba(0,187,255,0.75)',
          borderColor: 'rgb(77,212,255)',
          borderWidth: 1
        }
      ]
    };

    new Chart(barChart.value, {
      type: 'bar',
      data: barData,
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        },
        plugins: {
          legend: {
            position: 'top'
          }
        }
      }
    });
  }
};

onMounted(async () => {
  try {
    await fetchRoutes();
  } catch (error) {
    console.error('Error en onMounted:', error);
  }
});
</script>
<style scoped>
.chart-container {
  width: 300px;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: auto;
}

.no-routes{
  text-align: center;
  font-size: 1.2rem;
  color: gray;
  margin: 20px 0;
}
</style>
