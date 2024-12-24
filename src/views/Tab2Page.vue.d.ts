declare module '@/views/Tab2Page.vue' {
    import { DefineComponent } from 'vue';

    interface RouteCoordinate {
        lat: number;
        lng: number;
    }

    const Tab2Page: DefineComponent<object, object, any>;

    export default Tab2Page;
}