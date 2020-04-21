/**
 * Created by jekson on 06.07.2017.
 */
interface INewsItem {
    id: number;
    created: number;
    title: string;
    url: string;
    type: string;
    time: number;
    check?: number;
}